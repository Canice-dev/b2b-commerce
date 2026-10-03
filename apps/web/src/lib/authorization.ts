import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { adminProfiles, distributorProfiles } from "@/db/schema";

export async function isCompanyAdmin(userId: string) {
  const [admin] = await db
    .select({ userId: adminProfiles.userId })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, userId))
    .limit(1);

  return Boolean(admin);
}

export async function getActiveDistributor(userId: string) {
  const [distributor] = await db
    .select({
      id: distributorProfiles.id,
      businessName: distributorProfiles.businessName,
    })
    .from(distributorProfiles)
    .where(
      and(
        eq(distributorProfiles.ownerUserId, userId),
        eq(distributorProfiles.isActive, true),
      ),
    )
    .limit(1);

  return distributor ?? null;
}
