import { verifyToken } from "@clerk/backend";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { orders, users } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  }

  try {
    const claims = await verifyToken(token, { secretKey });
    if (!claims?.sub) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, claims.sub))
      .limit(1);

    if (!user) return Response.json({ orders: [] });

    const customerOrders = await db
      .select({
        id: orders.id,
        createdAt: orders.createdAt,
        fulfilmentStatus: orders.fulfilmentStatus,
        paymentStatus: orders.paymentStatus,
        orderedTotalKobo: orders.orderedTotalKobo,
      })
      .from(orders)
      .where(eq(orders.customerId, user.id))
      .orderBy(desc(orders.createdAt));

    return Response.json({ orders: customerOrders });
  } catch (error) {
    console.error("Unable to load mobile customer orders.", error);
    return Response.json(
      { error: "Unable to load your orders." },
      { status: 500 },
    );
  }
}
