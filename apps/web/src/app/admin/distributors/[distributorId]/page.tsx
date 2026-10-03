import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, MapPinned, Package, Store, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  distributorProfiles,
  distributorSettings,
  localGovernmentAreas,
  marketDistributorAssignments,
  markets,
  products,
  states,
  users,
} from "@/db/schema";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

export default async function DistributorDetailPage(
  props: PageProps<"/admin/distributors/[distributorId]">,
) {
  const { distributorId } = await props.params;
  const [distributor] = await db
    .select({
      id: distributorProfiles.id,
      businessName: distributorProfiles.businessName,
      phone: distributorProfiles.contactPhone,
      isActive: distributorProfiles.isActive,
      ownerName: users.name,
      ownerEmail: users.email,
      minimumOrderKobo: distributorSettings.minimumOrderAmountKobo,
    })
    .from(distributorProfiles)
    .innerJoin(users, eq(distributorProfiles.ownerUserId, users.id))
    .leftJoin(
      distributorSettings,
      eq(distributorSettings.distributorId, distributorProfiles.id),
    )
    .where(eq(distributorProfiles.id, distributorId))
    .limit(1);

  if (!distributor) notFound();

  const [territories, catalogue] = await Promise.all([
    db
      .select({
        id: markets.id,
        market: markets.name,
        lga: localGovernmentAreas.name,
        state: states.name,
      })
      .from(marketDistributorAssignments)
      .innerJoin(markets, eq(markets.id, marketDistributorAssignments.marketId))
      .innerJoin(
        localGovernmentAreas,
        eq(localGovernmentAreas.id, markets.localGovernmentAreaId),
      )
      .innerJoin(states, eq(states.id, localGovernmentAreas.stateId))
      .where(
        and(
          eq(marketDistributorAssignments.distributorId, distributor.id),
          eq(marketDistributorAssignments.isActive, true),
        ),
      )
      .orderBy(
        asc(states.name),
        asc(localGovernmentAreas.name),
        asc(markets.name),
      ),
    db
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
      .where(eq(products.distributorId, distributor.id))
      .orderBy(asc(products.name)),
  ]);
  const activeProducts = catalogue.filter((product) => product.isActive);
  const stockUnits = activeProducts.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-[1540px] px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:py-6">
      <Link
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-950"
        href="/admin/distributors"
      >
        <ArrowLeft size={14} />
        Back to distributors
      </Link>

      <section className="mt-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Store className="size-5 text-slate-500" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {distributor.businessName}
            </h1>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${distributor.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
            >
              {distributor.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{distributor.phone}</p>
        </div>
        <div className="text-sm sm:text-right">
          <p className="text-xs text-slate-500">Minimum order</p>
          <p className="mt-1 font-semibold tabular-nums text-slate-900">
            {formatNaira(distributor.minimumOrderKobo ?? 0)}
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <UserRound size={16} className="text-slate-500" />
            Owner account
          </div>
          <p className="mt-4 text-sm font-medium text-slate-800">
            {distributor.ownerName ?? "Unassigned"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {distributor.ownerEmail}
          </p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPinned size={16} className="text-slate-500" />
            Assigned territories
          </div>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
            {territories.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            active market assignments
          </p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Package size={16} className="text-slate-500" />
            Catalogue & stock
          </div>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
            {activeProducts.length} products
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {stockUnits.toLocaleString("en-NG")} available units
          </p>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-700">
              Assigned territories
            </h2>
            <Link
              className="text-xs font-medium text-slate-600 hover:text-slate-950"
              href="/admin/territories"
            >
              Manage territories
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {territories.length ? (
              territories.map((territory) => (
                <div className="px-4 py-3" key={territory.id}>
                  <p className="text-sm font-medium text-slate-800">
                    {territory.market}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {territory.lga}, {territory.state}
                  </p>
                </div>
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                No markets assigned yet.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-700">
              Catalogue & stock
            </h2>
            <Link
              className="text-xs font-medium text-slate-600 hover:text-slate-950"
              href="/admin/catalogue"
            >
              Manage catalogue
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
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
                      <td className="border-t border-slate-100 px-4 py-3 tabular-nums text-slate-700">
                        {formatNaira(product.priceKobo)}
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                        {product.quantity.toLocaleString("en-NG")}{" "}
                        {product.unit}
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
                      className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500"
                      colSpan={4}
                    >
                      No products have been added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
