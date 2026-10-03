"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  auditEvents,
  distributorProfiles,
  localGovernmentAreas,
  marketDistributorAssignments,
  markets,
  states,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

async function requireCompanyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export async function createTerritory(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const stateName = requiredText(formData, "stateName", "State");
  const stateCode = requiredText(
    formData,
    "stateCode",
    "State code",
  ).toUpperCase();
  const lgaName = requiredText(formData, "lgaName", "LGA");
  const marketName = requiredText(formData, "marketName", "Market");
  const distributorId = formData.get("distributorId");

  if (!/^[A-Z]{2,8}$/.test(stateCode)) {
    throw new Error("State code must contain 2–8 letters.");
  }
  if (
    stateName.length > 120 ||
    lgaName.length > 120 ||
    marketName.length > 120
  ) {
    throw new Error("Territory names must be 120 characters or fewer.");
  }
  if (
    distributorId !== null &&
    distributorId !== "" &&
    (typeof distributorId !== "string" || !uuidPattern.test(distributorId))
  ) {
    throw new Error("Choose a valid distributor.");
  }

  await db
    .insert(states)
    .values({ name: stateName, code: stateCode })
    .onConflictDoNothing();
  const [state] = await db
    .select({ id: states.id })
    .from(states)
    .where(eq(states.code, stateCode))
    .limit(1);
  if (!state) throw new Error("Could not create the state.");

  await db
    .insert(localGovernmentAreas)
    .values({ stateId: state.id, name: lgaName })
    .onConflictDoNothing();
  const [lga] = await db
    .select({ id: localGovernmentAreas.id })
    .from(localGovernmentAreas)
    .where(
      and(
        eq(localGovernmentAreas.stateId, state.id),
        eq(localGovernmentAreas.name, lgaName),
      ),
    )
    .limit(1);
  if (!lga) throw new Error("Could not create the LGA.");

  await db
    .insert(markets)
    .values({ localGovernmentAreaId: lga.id, name: marketName })
    .onConflictDoNothing();
  const [market] = await db
    .select({ id: markets.id })
    .from(markets)
    .where(
      and(
        eq(markets.localGovernmentAreaId, lga.id),
        eq(markets.name, marketName),
      ),
    )
    .limit(1);
  if (!market) throw new Error("Could not create the market.");

  if (typeof distributorId === "string" && distributorId) {
    const [distributor] = await db
      .select({ id: distributorProfiles.id })
      .from(distributorProfiles)
      .where(
        and(
          eq(distributorProfiles.id, distributorId),
          eq(distributorProfiles.isActive, true),
        ),
      )
      .limit(1);
    if (!distributor) throw new Error("That distributor is unavailable.");

    await db.batch([
      db
        .update(marketDistributorAssignments)
        .set({ isActive: false, endsAt: new Date() })
        .where(
          and(
            eq(marketDistributorAssignments.marketId, market.id),
            eq(marketDistributorAssignments.isActive, true),
          ),
        ),
      db
        .insert(marketDistributorAssignments)
        .values({ marketId: market.id, distributorId }),
    ]);
  }

  await db.insert(auditEvents).values({
    actorUserId,
    action: "territory.created",
    resourceType: "market",
    resourceId: market.id,
    afterData: {
      stateName,
      stateCode,
      lgaName,
      marketName,
      distributorId: distributorId || null,
    },
  });

  revalidatePath("/admin/territories");
  revalidatePath("/admin");
}

export async function updateMarketAssignment(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const marketId = requiredText(formData, "marketId", "Market");
  const distributorId = formData.get("distributorId");
  if (!uuidPattern.test(marketId)) throw new Error("Invalid market.");
  if (typeof distributorId !== "string")
    throw new Error("Invalid distributor.");
  if (distributorId && !uuidPattern.test(distributorId))
    throw new Error("Invalid distributor.");

  const [market] = await db
    .select({ id: markets.id })
    .from(markets)
    .where(eq(markets.id, marketId))
    .limit(1);
  if (!market) throw new Error("Market not found.");

  if (distributorId) {
    const [distributor] = await db
      .select({ id: distributorProfiles.id })
      .from(distributorProfiles)
      .where(
        and(
          eq(distributorProfiles.id, distributorId),
          eq(distributorProfiles.isActive, true),
        ),
      )
      .limit(1);
    if (!distributor) throw new Error("That distributor is unavailable.");
  }

  const deactivateCurrentAssignment = db
    .update(marketDistributorAssignments)
    .set({ isActive: false, endsAt: new Date() })
    .where(
      and(
        eq(marketDistributorAssignments.marketId, marketId),
        eq(marketDistributorAssignments.isActive, true),
      ),
    );
  const auditAssignmentChange = db.insert(auditEvents).values({
    actorUserId,
    action: "territory.assignment_updated",
    resourceType: "market",
    resourceId: marketId,
    afterData: { distributorId: distributorId || null },
  });

  if (distributorId) {
    await db.batch([
      deactivateCurrentAssignment,
      db
        .insert(marketDistributorAssignments)
        .values({ marketId, distributorId }),
      auditAssignmentChange,
    ]);
  } else {
    await db.batch([deactivateCurrentAssignment, auditAssignmentChange]);
  }

  revalidatePath("/admin/territories");
  revalidatePath("/admin");
}
