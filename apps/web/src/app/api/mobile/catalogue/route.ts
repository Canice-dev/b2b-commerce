import { verifyToken } from "@clerk/backend";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return Response.json({ error: "Authentication is not configured." }, { status: 503 });
  try {
    await verifyToken(token, { secretKey });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const catalogue = await db
    .select({
      id: products.id,
      name: products.name,
      variant: products.variant,
      unit: products.unit,
      unitPriceKobo: products.unitPriceKobo,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.name));

  return Response.json({ products: catalogue });
}
