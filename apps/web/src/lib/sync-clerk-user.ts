import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import type { ClerkUser } from "@/lib/clerk-webhook";
import { getClerkUserProfile } from "@/lib/clerk-webhook";

/** Creates or updates the application record for a Clerk user. */
export async function syncClerkUser(clerkUser: ClerkUser) {
  const profile = getClerkUserProfile(clerkUser);

  const existingUserByClerkId = (
    await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, profile.clerkUserId))
      .limit(1)
  )[0];

  // A legacy admin or distributor can already have an application account
  // without a Clerk ID. Attach the new Clerk identity instead of creating a
  // second row and orphaning their business records.
  const existingUserByEmail = !existingUserByClerkId && profile.email
    ? (
        await db
          .select({ id: users.id, clerkUserId: users.clerkUserId })
          .from(users)
          .where(eq(users.email, profile.email))
          .limit(1)
      )[0]
    : undefined;

  if (existingUserByClerkId) {
    await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, existingUserByClerkId.id));
    return;
  }

  if (existingUserByEmail) {
    if (
      existingUserByEmail.clerkUserId &&
      existingUserByEmail.clerkUserId !== profile.clerkUserId
    ) {
      throw new Error(
        "Cannot link a Clerk user to an email already linked to another Clerk user.",
      );
    }

    await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, existingUserByEmail.id));
    return;
  }

  await db
    .insert(users)
    .values(profile)
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { ...profile, updatedAt: new Date() },
    });
}
