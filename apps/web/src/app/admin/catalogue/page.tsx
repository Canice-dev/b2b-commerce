import { asc } from "drizzle-orm";
import { Package } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  AddProductDialog,
  AdjustStockDialog,
  EditProductDialog,
} from "./product-dialogs";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

export default async function CataloguePage() {
  const catalogue = await db
    .select({
      id: products.id,
      name: products.name,
      variant: products.variant,
      unit: products.unit,
      priceKobo: products.unitPriceKobo,
      quantity: products.availableQuantity,
      isActive: products.isActive,
    })
    .from(products)
    .orderBy(asc(products.name));
  const activeProducts = catalogue.filter((product) => product.isActive);
  const availableStock = activeProducts.reduce(
    (total, product) => total + product.quantity,
    0,
  );
  return (
    <AdminPageShell
      action="Add product"
      actionSlot={<AddProductDialog />}
      description="View company products and add or adjust the stock available for ordering."
      icon={Package}
      label="Catalogue & stock"
      title="Catalogue and stock"
    >
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Company product inventory
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{activeProducts.length} active products</span>
            <span>
              {availableStock.toLocaleString("en-NG")} units available
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Unit price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {catalogue.length ? (
                catalogue.map((product) => (
                  <tr key={product.id}>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {product.variant ?? product.unit}
                      </p>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {formatNaira(product.priceKobo)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      <p>
                        {product.quantity.toLocaleString("en-NG")}{" "}
                        {product.unit}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${product.quantity ? "text-emerald-700" : "text-rose-700"}`}
                      >
                        {product.quantity ? "In stock" : "Out of stock"}
                      </p>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <AdjustStockDialog product={product} />
                        <EditProductDialog product={product} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border-t border-slate-100 px-4 py-10 text-center text-slate-500"
                    colSpan={5}
                  >
                    No products have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}
