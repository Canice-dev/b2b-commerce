"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { auditEvents, inventoryMovements, products, restockOrderItems, restockOrders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

export async function reviewRestockOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) throw new Error("Unauthorized");
  const id = formData.get("restockOrderId");
  const decision = formData.get("decision");
  if (typeof id !== "string" || !id || (decision !== "approved" && decision !== "rejected")) throw new Error("Invalid restock request.");
  const reviewNoteValue = formData.get("reviewNote");
  const reviewNote = typeof reviewNoteValue === "string" && reviewNoteValue.trim() ? reviewNoteValue.trim() : null;
  const [updated] = await db.update(restockOrders).set({ status: decision, reviewedByUserId: session.user.id, reviewedAt: new Date(), reviewNote, updatedAt: new Date() }).where(and(eq(restockOrders.id, id), eq(restockOrders.status, "submitted"))).returning({ id: restockOrders.id });
  if (!updated) throw new Error("This restock request has already been reviewed.");
  await db.insert(auditEvents).values({ actorUserId: session.user.id, action: `restock_order.${decision}`, resourceType: "restock_order", resourceId: id, afterData: { reviewNote } });
  revalidatePath("/admin/restock");
  revalidatePath("/distributor/restock");
}

export async function dispatchRestockOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) throw new Error("Unauthorized");
  const id = formData.get("restockOrderId");
  if (typeof id !== "string" || !id) throw new Error("Invalid restock request.");
  const items = await db.select({ productId: restockOrderItems.productId, quantity: restockOrderItems.requestedQuantity, name: restockOrderItems.productNameSnapshot }).from(restockOrderItems).where(eq(restockOrderItems.restockOrderId, id));
  if (!items.length) throw new Error("This restock request has no products.");
  const stock = await db.select({ id: products.id, available: products.availableQuantity }).from(products);
  const stockByProduct = new Map(stock.map((product) => [product.id, product.available]));
  const unavailable = items.find((item) => (stockByProduct.get(item.productId) ?? 0) < item.quantity);
  if (unavailable) throw new Error(`Insufficient company stock for ${unavailable.name}.`);
  const [updated] = await db.update(restockOrders).set({ status: "dispatched", dispatchedAt: new Date(), updatedAt: new Date() }).where(and(eq(restockOrders.id, id), eq(restockOrders.status, "approved"))).returning({ id: restockOrders.id });
  if (!updated) throw new Error("Only approved restock requests can be dispatched.");
  for (const item of items) {
    const [deductedProduct] = await db
      .update(products)
      .set({
        availableQuantity: sql`${products.availableQuantity} - ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, item.productId),
          gte(products.availableQuantity, item.quantity),
        ),
      )
      .returning({ id: products.id });
    if (!deductedProduct) {
      throw new Error(`Insufficient company stock for ${item.name}.`);
    }
    await db.insert(inventoryMovements).values({
      productId: item.productId,
      quantityDelta: -item.quantity,
      reason: "manual_adjustment",
      note: `Dispatched restock request ${id.slice(0, 8)}`,
      createdByUserId: session.user.id,
    });
  }
  await db.insert(auditEvents).values({ actorUserId: session.user.id, action: "restock_order.dispatched", resourceType: "restock_order", resourceId: id, afterData: { itemCount: items.length } });
  revalidatePath("/admin/restock");
  revalidatePath("/distributor/restock");
}
