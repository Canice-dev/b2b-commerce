import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminProfiles } from "@/db/schema";

export async function isCompanyAdmin(userId: string) {
  const [admin] = await db
    .select({ userId: adminProfiles.userId })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, userId))
    .limit(1);

  return Boolean(admin);
}
