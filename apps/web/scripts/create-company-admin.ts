import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "better-auth/crypto";

async function main() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const db = drizzle(databaseUrl);
  const { accounts, adminProfiles, userRoles, users } = await import(
    "../src/db/schema"
  );
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Company Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  if (!email.includes("@")) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    throw new Error("A user with this email already exists; no changes were made.");
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  await db.batch([
    db.insert(users).values({
      id: userId,
      email,
      name,
      emailVerified: true,
    }),
    db.insert(accounts).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    }),
    db.insert(userRoles).values({ userId, role: "admin" }),
    db.insert(adminProfiles).values({ userId }),
  ]);

  console.log(`Company admin created for ${email}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
