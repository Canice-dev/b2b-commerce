import { asc, eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import { distributorProfiles, products } from "@/db/schema";

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
      distributor: distributorProfiles.businessName,
    })
    .from(products)
    .innerJoin(
      distributorProfiles,
      eq(products.distributorId, distributorProfiles.id),
    )
    .orderBy(asc(products.name));
  return (
    <AdminPageShell
      action="Add product"
      description="Maintain your product catalogue, pricing, and available stock."
      icon={Package}
      label="Catalogue & stock"
      title="Catalogue and stock"
    >
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Available products
          </p>
          <span className="text-xs text-slate-500">
            {catalogue.filter((product) => product.isActive).length} active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Distributor</th>
                <th className="px-4 py-3">Unit price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
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
                      {product.distributor}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {formatNaira(product.priceKobo)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
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
