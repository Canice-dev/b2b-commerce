import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  isClerkUserDeletedEvent,
  isClerkUserEvent,
  verifyClerkWebhook,
} from "@/lib/clerk-webhook";
import { syncClerkUser } from "@/lib/sync-clerk-user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let event;

  try {
    event = verifyClerkWebhook(await request.text(), request.headers);
  } catch (error) {
    // A bad signature should not be retried. The detailed reason remains in
    // server logs; do not expose it to the caller.
    console.error("Unable to verify Clerk webhook.", error);
    return new Response("Invalid webhook", { status: 400 });
  }

  try {
    if (isClerkUserEvent(event)) {
      await syncClerkUser(event.data);
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
    // Return a 5xx so Clerk retries an event when the database is temporarily
    // unavailable. Signature failures above remain a non-retryable 400.
    return new Response("Unable to process webhook", { status: 500 });
  }
}
