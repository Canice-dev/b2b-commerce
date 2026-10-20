import { createClerkClient, verifyToken } from "@clerk/backend";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  customerLegalAcceptances,
  customerProfiles,
  distributorProfiles,
  marketDistributorAssignments,
  markets,
  neighbourServiceAssignments,
  users,
} from "@/db/schema";
import type { ClerkUser } from "@/lib/clerk-webhook";
import { syncClerkUser } from "@/lib/sync-clerk-user";

export const runtime = "nodejs";

type OnboardingPayload = {
  businessName?: unknown;
  phone?: unknown;
  address?: unknown;
  businessType?: unknown;
  marketId?: unknown;
  acceptedLegalTerms?: unknown;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim() || null
    : null;
}

function getClerkSecretKey() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured.");
  return secretKey;
}

function requiredText(value: unknown, label: string, maximumLength: number) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const text = value.trim();
  if (!text || text.length > maximumLength) {
    throw new Error(`Enter a valid ${label.toLowerCase()}.`);
  }
  return text;
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

  try {
    const secretKey = getClerkSecretKey();
    const claims = await verifyToken(token, { secretKey });
    if (!claims?.sub)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = (await request.json()) as OnboardingPayload;
    const businessName = requiredText(
      payload.businessName,
      "Business name",
      160,
    );
    const phone = requiredText(payload.phone, "Phone number", 32);
    const address = requiredText(payload.address, "Shop address", 500);
    const marketId = requiredText(payload.marketId, "Market", 64);

    if (
      payload.businessType !== "retailer" &&
      payload.businessType !== "wholesaler"
    ) {
      return Response.json(
        { error: "Choose a business type." },
        { status: 400 },
      );
    }
    if (payload.acceptedLegalTerms !== true) {
      return Response.json(
        { error: "Accept the Terms and Privacy Policy to continue." },
        { status: 400 },
      );
    }

    const clerk = createClerkClient({ secretKey });
    const clerkUser = await clerk.users.getUser(claims.sub);
    await syncClerkUser(toClerkUser(clerkUser));

    const [user, primaryAssignment, neighbouringAssignment] = await Promise.all(
      [
        db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(eq(users.clerkUserId, claims.sub))
          .limit(1),
        db
          .select({ distributorId: marketDistributorAssignments.distributorId })
          .from(marketDistributorAssignments)
          .innerJoin(
            markets,
            eq(marketDistributorAssignments.marketId, markets.id),
          )
          .innerJoin(
            distributorProfiles,
            eq(
              marketDistributorAssignments.distributorId,
              distributorProfiles.id,
            ),
          )
          .where(
            and(
              eq(markets.id, marketId),
              eq(marketDistributorAssignments.isActive, true),
              eq(distributorProfiles.isActive, true),
            ),
          )
          .limit(1),
        db
          .select({ distributorId: neighbourServiceAssignments.distributorId })
          .from(neighbourServiceAssignments)
          .innerJoin(
            markets,
            eq(neighbourServiceAssignments.marketId, markets.id),
          )
          .innerJoin(
            distributorProfiles,
            eq(
              neighbourServiceAssignments.distributorId,
              distributorProfiles.id,
            ),
          )
          .where(
            and(
              eq(markets.id, marketId),
              eq(neighbourServiceAssignments.isActive, true),
              eq(distributorProfiles.isActive, true),
            ),
          )
          .limit(1),
      ],
    );

    if (!user[0]) throw new Error("Unable to prepare your account.");
    const assignment = primaryAssignment[0] ?? neighbouringAssignment[0];
    if (!assignment) {
      return Response.json(
        { error: "That market is not currently served." },
        { status: 400 },
      );
    }

    await db
      .insert(customerProfiles)
      .values({
        userId: user[0].id,
        businessName,
        contactName: user[0].name || businessName,
        phone,
        businessType: payload.businessType,
        marketId,
        assignedDistributorId: assignment.distributorId,
        defaultAddress: address,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: customerProfiles.userId,
        set: {
          businessName,
          contactName: user[0].name || businessName,
          phone,
          businessType: payload.businessType,
          marketId,
          assignedDistributorId: assignment.distributorId,
          defaultAddress: address,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(customerLegalAcceptances)
      .values({
        userId: user[0].id,
        termsVersion: "pilot-v1",
        privacyPolicyVersion: "pilot-v1",
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: customerLegalAcceptances.userId,
        set: {
          termsVersion: "pilot-v1",
          privacyPolicyVersion: "pilot-v1",
          acceptedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    return Response.json({ completed: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save your details.";
    console.error("Unable to complete mobile onboarding.", error);
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const claims = await verifyToken(token, { secretKey: getClerkSecretKey() });
    if (!claims?.sub)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, claims.sub))
      .limit(1);

    if (!user) return Response.json({ completed: false });

    const [profile, legalAcceptance] = await Promise.all([
      db
        .select({ userId: customerProfiles.userId })
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, user.id))
        .limit(1),
      db
        .select({ userId: customerLegalAcceptances.userId })
        .from(customerLegalAcceptances)
        .where(eq(customerLegalAcceptances.userId, user.id))
        .limit(1),
    ]);

    return Response.json({ completed: Boolean(profile && legalAcceptance) });
  } catch (error) {
    console.error("Unable to load mobile onboarding status.", error);
    return Response.json(
      { error: "Unable to load onboarding status." },
      { status: 500 },
    );
  }
}
