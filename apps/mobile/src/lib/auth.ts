import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";

import {
  accounts,
  sessions,
  users,
  verifications,
} from "@/server/auth-schema";
import { db } from "./db";

const appScheme = process.env.MOBILE_APP_SCHEME ?? "mobile";
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const appleClientId = process.env.APPLE_CLIENT_ID;
const appleClientSecret = process.env.APPLE_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "Distributor Direct Ordering Mobile",
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { users, accounts, sessions, verifications },
  }),
  user: { modelName: "users" },
  account: { modelName: "accounts" },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  verification: { modelName: "verifications" },
  advanced: { database: { generateId: "uuid" } },
  trustedOrigins: [
    `${appScheme}://`,
    `${appScheme}://*`,
    ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**"] : []),
  ],
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
    ...(appleClientId && appleClientSecret
      ? {
          apple: {
            clientId: appleClientId,
            clientSecret: appleClientSecret,
          },
        }
      : {}),
  },
  plugins: [expo()],
});
