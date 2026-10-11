import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  getClerkUserProfile,
  isClerkUserDeletedEvent,
  isClerkUserEvent,
  verifyClerkWebhook,
} from "@/lib/clerk-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const event = verifyClerkWebhook(await request.text(), request.headers);

    if (isClerkUserEvent(event)) {
      const profile = getClerkUserProfile(event.data);

      await db
        .insert(users)
        .values(profile)
        .onConflictDoUpdate({
          target: users.clerkUserId,
          set: { ...profile, updatedAt: new Date() },
        });
    }

    if (isClerkUserDeletedEvent(event) && event.data.id) {
      await db
        .update(users)
        .set({ status: "disabled", updatedAt: new Date() })
        .where(eq(users.clerkUserId, event.data.id));
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Unable to process Clerk webhook.", error);
    return new Response("Invalid webhook", { status: 400 });
  }
}
