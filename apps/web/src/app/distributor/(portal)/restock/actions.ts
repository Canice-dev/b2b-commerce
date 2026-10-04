"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { auditEvents, distributorInventories, distributorInventoryMovements, products, restockOrderItems, restockOrders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";

export async function submitRestockOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const distributor = session ? await getActiveDistributor(session.user.id) : null;
  if (!session || !distributor) throw new Error("Unauthorized");

  const catalogue = await db.select().from(products).where(eq(products.isActive, true));
  const items = catalogue.flatMap((product) => {
    const rawQuantity = formData.get(`quantity-${product.id}`);
    if (typeof rawQuantity !== "string" || !rawQuantity.trim()) return [];
    if (!/^\d+$/.test(rawQuantity) || Number(rawQuantity) < 1) {
      throw new Error(`Enter a whole number for ${product.name}.`);
    }
    return [{ product, quantity: Number(rawQuantity) }];
  });
  if (!items.length) throw new Error("Add at least one product to your restock request.");

  const rawNote = formData.get("note");
  const note = typeof rawNote === "string" && rawNote.trim() ? rawNote.trim() : null;
  if (note && note.length > 500) throw new Error("Note must be 500 characters or fewer.");

  const [restockOrder] = await db.insert(restockOrders).values({ distributorId: distributor.id, note }).returning({ id: restockOrders.id });
  if (!restockOrder) throw new Error("Could not create restock request.");
  await db.batch([
    db.insert(restockOrderItems).values(items.map(({ product, quantity }) => ({ restockOrderId: restockOrder.id, productId: product.id, productNameSnapshot: product.name, variantSnapshot: product.variant, unitSnapshot: product.unit, requestedQuantity: quantity }))),
    db.insert(auditEvents).values({ actorUserId: session.user.id, action: "restock_order.submitted", resourceType: "restock_order", resourceId: restockOrder.id, afterData: { itemCount: items.length, note } }),
  ]);
  revalidatePath("/distributor/restock");
  revalidatePath("/admin/restock");
}

export async function receiveRestockOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const distributor = session ? await getActiveDistributor(session.user.id) : null;
  if (!session || !distributor) throw new Error("Unauthorized");
  const restockOrderId = formData.get("restockOrderId");
  if (typeof restockOrderId !== "string" || !restockOrderId) throw new Error("Invalid restock request.");
  const [receivedOrder] = await db.update(restockOrders).set({ status: "received", receivedAt: new Date(), updatedAt: new Date() }).where(and(eq(restockOrders.id, restockOrderId), eq(restockOrders.distributorId, distributor.id), eq(restockOrders.status, "dispatched"))).returning({ id: restockOrders.id });
  if (!receivedOrder) throw new Error("Only dispatched restock requests can be received.");
  const items = await db.select({ productId: restockOrderItems.productId, quantity: restockOrderItems.requestedQuantity }).from(restockOrderItems).where(eq(restockOrderItems.restockOrderId, restockOrderId));
  for (const item of items) {
    await db
      .insert(distributorInventories)
      .values({
        distributorId: distributor.id,
        productId: item.productId,
        availableQuantity: item.quantity,
      })
      .onConflictDoUpdate({
        target: [
          distributorInventories.distributorId,
          distributorInventories.productId,
        ],
        set: {
          availableQuantity: sql`${distributorInventories.availableQuantity} + ${item.quantity}`,
          updatedAt: new Date(),
        },
      });
  }
  await db.batch([
    db.insert(distributorInventoryMovements).values(
      items.map((item) => ({
        distributorId: distributor.id,
        productId: item.productId,
        restockOrderId,
        quantityDelta: item.quantity,
        reason: "restock_received" as const,
        createdByUserId: session.user.id,
      })),
    ),
    db.insert(auditEvents).values({ actorUserId: session.user.id, action: "restock_order.received", resourceType: "restock_order", resourceId: restockOrderId, afterData: { itemCount: items.length } }),
  ]);
  revalidatePath("/distributor/restock");
  revalidatePath("/distributor/catalogue");
  revalidatePath("/admin/restock");
}
