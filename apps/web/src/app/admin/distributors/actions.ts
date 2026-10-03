"use server";

import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  accounts,
  auditEvents,
  distributorProfiles,
  distributorSettings,
  userRoles,
  users,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

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

export async function createDistributor(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const businessName = requiredText(formData, "businessName", "Business name");
  const contactPhone = requiredText(formData, "contactPhone", "Contact phone");
  const ownerName = requiredText(formData, "ownerName", "Owner name");
  const ownerEmail = requiredText(
    formData,
    "ownerEmail",
    "Owner email",
  ).toLowerCase();
  const password = requiredText(formData, "password", "Temporary password");
  const minimumOrderNaira = requiredText(
    formData,
    "minimumOrderNaira",
    "Minimum order",
  );
  const minimumOrder = Number(minimumOrderNaira);

  if (!/^\S+@\S+\.\S+$/.test(ownerEmail))
    throw new Error("Enter a valid owner email.");
  if (password.length < 12)
    throw new Error("Temporary password must be at least 12 characters.");
  if (
    !Number.isFinite(minimumOrder) ||
    minimumOrder < 0 ||
    !/^\d+(\.\d{1,2})?$/.test(minimumOrderNaira)
  ) {
    throw new Error("Minimum order must be a valid non-negative Naira amount.");
  }
  if (
    [businessName, contactPhone, ownerName].some((value) => value.length > 120)
  ) {
    throw new Error(
      "Business, owner, and phone details must be 120 characters or fewer.",
    );
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ownerEmail))
    .limit(1);
  if (existingUser) throw new Error("That owner email already has an account.");

  const userId = randomUUID();
  const distributorId = randomUUID();
  const passwordHash = await hashPassword(password);
  const minimumOrderAmountKobo = Math.round(minimumOrder * 100);

  await db.batch([
    db.insert(users).values({
      id: userId,
      email: ownerEmail,
      name: ownerName,
      emailVerified: true,
    }),
    db.insert(accounts).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    }),
    db.insert(userRoles).values({ userId, role: "distributor" }),
    db.insert(distributorProfiles).values({
      id: distributorId,
      ownerUserId: userId,
      businessName,
      contactPhone,
    }),
    db.insert(distributorSettings).values({
      distributorId,
      minimumOrderAmountKobo,
    }),
    db.insert(auditEvents).values({
      actorUserId,
      action: "distributor.created",
      resourceType: "distributor",
      resourceId: distributorId,
      afterData: {
        businessName,
        contactPhone,
        ownerName,
        ownerEmail,
        minimumOrderAmountKobo,
      },
    }),
  ]);

  revalidatePath("/admin/distributors");
  revalidatePath("/admin/territories");
  revalidatePath("/admin");
}

export async function updateDistributor(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const distributorId = requiredText(formData, "distributorId", "Distributor");
  const ownerUserId = requiredText(formData, "ownerUserId", "Owner");
  const businessName = requiredText(formData, "businessName", "Business name");
  const contactPhone = requiredText(formData, "contactPhone", "Contact phone");
  const ownerName = requiredText(formData, "ownerName", "Owner name");
  const ownerEmail = requiredText(formData, "ownerEmail", "Owner email").toLowerCase();
  const minimumOrderNaira = requiredText(formData, "minimumOrderNaira", "Minimum order");
  const minimumOrder = Number(minimumOrderNaira);
  const isActive = formData.get("isActive") === "on";

  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(distributorId) || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(ownerUserId)) {
    throw new Error("Invalid distributor.");
  }
  if (!/^\S+@\S+\.\S+$/.test(ownerEmail)) throw new Error("Enter a valid owner email.");
  if (!Number.isFinite(minimumOrder) || minimumOrder < 0 || !/^\d+(\.\d{1,2})?$/.test(minimumOrderNaira)) {
    throw new Error("Minimum order must be a valid non-negative Naira amount.");
  }
  if ([businessName, contactPhone, ownerName].some((value) => value.length > 120)) {
    throw new Error("Business, owner, and phone details must be 120 characters or fewer.");
  }

  const [distributor] = await db
    .select({ id: distributorProfiles.id })
    .from(distributorProfiles)
    .where(and(eq(distributorProfiles.id, distributorId), eq(distributorProfiles.ownerUserId, ownerUserId)))
    .limit(1);
  if (!distributor) throw new Error("Distributor not found.");

  const [emailInUse] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, ownerEmail), ne(users.id, ownerUserId)))
    .limit(1);
  if (emailInUse) throw new Error("That owner email already has an account.");

  const minimumOrderAmountKobo = Math.round(minimumOrder * 100);
  await db.batch([
    db
      .update(users)
      .set({ name: ownerName, email: ownerEmail, updatedAt: new Date() })
      .where(eq(users.id, ownerUserId)),
    db
      .update(distributorProfiles)
      .set({ businessName, contactPhone, isActive, updatedAt: new Date() })
      .where(eq(distributorProfiles.id, distributorId)),
    db
      .update(distributorSettings)
      .set({ minimumOrderAmountKobo, updatedAt: new Date() })
      .where(eq(distributorSettings.distributorId, distributorId)),
    db.insert(auditEvents).values({
      actorUserId,
      action: "distributor.updated",
      resourceType: "distributor",
      resourceId: distributorId,
      afterData: { businessName, contactPhone, ownerName, ownerEmail, minimumOrderAmountKobo, isActive },
    }),
  ]);

  revalidatePath("/admin/distributors");
  revalidatePath("/admin/territories");
  revalidatePath("/admin");
}
