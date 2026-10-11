import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

type ClerkEmailAddress = {
  id: string;
  email_address: string;
  verification?: { status?: string | null } | null;
};

export type ClerkUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[];
};

export type ClerkUserDeleted = { id: string | null };

export type ClerkWebhookEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUser }
  | { type: "user.deleted"; data: ClerkUserDeleted }
  | { type: string; data: unknown };

export function isClerkUserEvent(
  event: ClerkWebhookEvent,
): event is { type: "user.created" | "user.updated"; data: ClerkUser } {
  return event.type === "user.created" || event.type === "user.updated";
}

export function isClerkUserDeletedEvent(
  event: ClerkWebhookEvent,
): event is { type: "user.deleted"; data: ClerkUserDeleted } {
  return event.type === "user.deleted";
}

function getSigningSecret() {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SIGNING_SECRET is not configured.");
  }

  if (!secret.startsWith("whsec_")) {
    throw new Error("CLERK_WEBHOOK_SIGNING_SECRET has an invalid format.");
  }

  return Buffer.from(secret.slice("whsec_".length), "base64");
}

function isValidSignature(
  signatureHeader: string,
  expectedSignature: Buffer,
) {
  return signatureHeader.split(" ").some((signature) => {
    const [version, value] = signature.split(",", 2);

    if (version !== "v1" || !value) return false;

    const receivedSignature = Buffer.from(value, "base64");

    return (
      receivedSignature.length === expectedSignature.length &&
      timingSafeEqual(receivedSignature, expectedSignature)
    );
  });
}

/**
 * Verifies the raw Svix payload sent by Clerk before it is parsed. Svix can
 * send multiple v1 signatures during signing-secret rotation, so any valid
 * v1 signature is accepted.
 */
export function verifyClerkWebhook(
  body: string,
  headers: Headers,
): ClerkWebhookEvent {
  const messageId = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");

  if (!messageId || !timestamp || !signature) {
    throw new Error("Missing Clerk webhook signature headers.");
  }

  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (
    !Number.isInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > MAX_WEBHOOK_AGE_SECONDS
  ) {
    throw new Error("Clerk webhook timestamp is outside the allowed window.");
  }

  const signedPayload = `${messageId}.${timestamp}.${body}`;
  const expectedSignature = createHmac("sha256", getSigningSecret())
    .update(signedPayload)
    .digest();

  if (!isValidSignature(signature, expectedSignature)) {
    throw new Error("Invalid Clerk webhook signature.");
  }

  return JSON.parse(body) as ClerkWebhookEvent;
}

export function getClerkUserProfile(user: ClerkUser) {
  const email = user.email_addresses.find(
    (emailAddress) => emailAddress.id === user.primary_email_address_id,
  );
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return {
    clerkUserId: user.id,
    email: email?.email_address ?? null,
    emailVerified: email?.verification?.status === "verified",
    image: user.image_url,
    name: name || null,
  };
}
