import { and, asc, eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { db } from "@/db";
import { distributorInventories, products } from "@/db/schema";
import { DataTable, PortalPage } from "../_components/portal-page";
import { formatNaira, getPortalDistributor } from "../_components/data";

export default async function CataloguePage() {
  const distributor = await getPortalDistributor();
  if (!distributor) return null;
  const catalogue = await db
    .select({
      id: products.id,
      name: products.name,
      variant: products.variant,
      unit: products.unit,
      price: products.unitPriceKobo,
      available: distributorInventories.availableQuantity,
    })
    .from(distributorInventories)
    .innerJoin(products, eq(products.id, distributorInventories.productId))
    .where(and(eq(products.isActive, true), eq(distributorInventories.distributorId, distributor.id)))
    .orderBy(asc(products.name));
  return (
    <PortalPage
      description="View your received stock available for customer orders."
      icon={Package}
      title="Catalogue"
    >
      <DataTable
        headers={[
          "Product",
          "Variant",
          "Unit",
          "Unit price",
          "Available stock",
        ]}
      >
        {catalogue.length ? (
          catalogue.map((product) => (
            <tr key={product.id}>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-700">
                {product.name}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {product.variant ?? "—"}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {product.unit}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-800">
                {formatNaira(product.price)}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {product.available}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500"
              colSpan={5}
            >
              You have not received any stock from the company yet.
            </td>
          </tr>
        )}
      </DataTable>
    </PortalPage>
  );
}
