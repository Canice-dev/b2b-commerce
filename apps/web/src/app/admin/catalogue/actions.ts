"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { auditEvents, inventoryMovements, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

function nonNegativeInteger(formData: FormData, field: string, label: string) {
  const value = requiredText(formData, field, label);
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} must be a whole number.`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} is too large.`);
  }
  return number;
}

function nairaToKobo(formData: FormData, field: string) {
  const value = requiredText(formData, field, "Unit price");
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error("Unit price must be a valid non-negative Naira amount.");
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount > 21_474_836.47) {
    throw new Error("Unit price is too large.");
  }
  return Math.round(amount * 100);
}

function productDetails(formData: FormData) {
  const name = requiredText(formData, "name", "Product name");
  const unit = requiredText(formData, "unit", "Unit");
  const variantValue = formData.get("variant");
  const variant =
    typeof variantValue === "string" && variantValue.trim()
      ? variantValue.trim()
      : null;
  const unitPriceKobo = nairaToKobo(formData, "unitPriceNaira");

  if (name.length > 160 || unit.length > 60 || (variant?.length ?? 0) > 120) {
    throw new Error("Product details are too long.");
  }

  return { name, variant, unit, unitPriceKobo };
}

async function requireCompanyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function revalidateCatalogue() {
  revalidatePath("/admin/catalogue");
  revalidatePath("/admin/distributors");
  revalidatePath("/admin");
}

export async function createProduct(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const details = productDetails(formData);
  const openingQuantity = nonNegativeInteger(
    formData,
    "openingQuantity",
    "Opening stock",
  );

  const [product] = await db
    .insert(products)
    .values({ ...details, availableQuantity: openingQuantity })
    .returning({ id: products.id });
  if (!product) throw new Error("Could not create the product.");

  if (openingQuantity) {
    await db.insert(inventoryMovements).values({
      productId: product.id,
      quantityDelta: openingQuantity,
      reason: "initial",
      note: "Opening stock",
      createdByUserId: actorUserId,
    });
  }
  await db.insert(auditEvents).values({
    actorUserId,
    action: "product.created",
    resourceType: "product",
    resourceId: product.id,
    afterData: { ...details, openingQuantity },
  });
  revalidateCatalogue();
}

export async function updateProduct(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const productId = requiredText(formData, "productId", "Product");
  const details = productDetails(formData);
  const isActive = formData.get("isActive") === "on";
  if (!uuidPattern.test(productId)) throw new Error("Invalid product.");

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) throw new Error("Product not found.");

  await db.batch([
    db
      .update(products)
      .set({ ...details, isActive, updatedAt: new Date() })
      .where(eq(products.id, productId)),
    db.insert(auditEvents).values({
      actorUserId,
      action: "product.updated",
      resourceType: "product",
      resourceId: productId,
      afterData: { ...details, isActive },
    }),
  ]);
  revalidateCatalogue();
}

export async function adjustStock(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const productId = requiredText(formData, "productId", "Product");
  const quantityDeltaText = requiredText(
    formData,
    "quantityDelta",
    "Quantity adjustment",
  );
  const note = requiredText(formData, "note", "Reason");
  if (!uuidPattern.test(productId)) throw new Error("Invalid product.");
  if (!/^-?\d+$/.test(quantityDeltaText))
    throw new Error("Quantity adjustment must be a whole number.");
  const quantityDelta = Number(quantityDeltaText);
  if (!Number.isSafeInteger(quantityDelta) || quantityDelta === 0) {
    throw new Error("Quantity adjustment must not be zero.");
  }
  if (note.length > 500)
    throw new Error("Reason must be 500 characters or fewer.");

  const stockGuard =
    quantityDelta < 0
      ? and(
          eq(products.id, productId),
          gte(products.availableQuantity, -quantityDelta),
        )
      : eq(products.id, productId);
  const [product] = await db
    .update(products)
    .set({
      availableQuantity: sql`${products.availableQuantity} + ${quantityDelta}`,
      updatedAt: new Date(),
    })
    .where(stockGuard)
    .returning({
      id: products.id,
      availableQuantity: products.availableQuantity,
    });
  if (!product) {
    throw new Error(
      quantityDelta < 0
        ? "Stock cannot fall below zero."
        : "Product not found.",
    );
  }

  await db.batch([
    db.insert(inventoryMovements).values({
      productId,
      quantityDelta,
      reason: "manual_adjustment",
      note,
      createdByUserId: actorUserId,
    }),
    db.insert(auditEvents).values({
      actorUserId,
      action: "product.stock_adjusted",
      resourceType: "product",
      resourceId: productId,
      afterData: {
        quantityDelta,
        availableQuantity: product.availableQuantity,
        note,
      },
    }),
  ]);
  revalidateCatalogue();
}

export async function archiveProduct(formData: FormData) {
  const actorUserId = await requireCompanyAdmin();
  const productId = requiredText(formData, "productId", "Product");
  if (!uuidPattern.test(productId)) throw new Error("Invalid product.");

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) throw new Error("Product not found.");

  await db.batch([
    db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, productId)),
    db.insert(auditEvents).values({
      actorUserId,
      action: "product.archived",
      resourceType: "product",
      resourceId: productId,
    }),
  ]);
  revalidateCatalogue();
}
