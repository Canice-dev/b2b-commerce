import { createClerkClient, verifyToken } from "@clerk/backend";

import type { ClerkUser } from "@/lib/clerk-webhook";
import { syncClerkUser } from "@/lib/sync-clerk-user";

export const runtime = "nodejs";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  return authorization.slice("Bearer ".length).trim() || null;
}

function getClerkSecretKey() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured.");

  return secretKey;
}

function toClerkUser(user: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  primaryEmailAddressId: string | null;
  emailAddresses: {
    id: string;
    emailAddress: string;
    verification: { status: string } | null;
  }[];
}): ClerkUser {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
    primary_email_address_id: user.primaryEmailAddressId,
    email_addresses: user.emailAddresses.map((emailAddress) => ({
      id: emailAddress.id,
      email_address: emailAddress.emailAddress,
      verification: emailAddress.verification,
    })),
  };
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string | undefined;

  try {
    const secretKey = getClerkSecretKey();
    const claims = await verifyToken(token, { secretKey });
    userId = claims?.sub;
  } catch (error) {
    console.error("Unable to verify the mobile Clerk token.", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const secretKey = getClerkSecretKey();
    // Fetch the profile from Clerk after token verification. This prevents a
    // client from choosing another user's ID or profile values.
    const clerk = createClerkClient({ secretKey });
    const clerkUser = await clerk.users.getUser(userId);
    await syncClerkUser(toClerkUser(clerkUser));

    return Response.json({ synced: true });
  } catch (error) {
    console.error("Unable to sync the mobile Clerk user.", error);
    return Response.json({ error: "Unable to sync user" }, { status: 500 });
  }
}
