import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { Truck } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import {
  distributorProfiles,
  distributorSettings,
  localGovernmentAreas,
  marketDistributorAssignments,
  markets,
  states,
  users,
} from "@/db/schema";
import { AddDistributorDialog } from "./add-distributor-dialog";
import { EditDistributorDialog } from "./edit-distributor-dialog";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

export default async function DistributorsPage() {
  const [distributors, territoryRows] = await Promise.all([db
    .select({
      id: distributorProfiles.id,
      ownerUserId: distributorProfiles.ownerUserId,
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
    .orderBy(asc(distributorProfiles.businessName)), db
    .select({ distributorId: marketDistributorAssignments.distributorId, market: markets.name, state: states.name })
    .from(marketDistributorAssignments)
    .innerJoin(markets, eq(markets.id, marketDistributorAssignments.marketId))
    .innerJoin(localGovernmentAreas, eq(localGovernmentAreas.id, markets.localGovernmentAreaId))
    .innerJoin(states, eq(states.id, localGovernmentAreas.stateId))
    .where(eq(marketDistributorAssignments.isActive, true))]);
  const territoriesByDistributor = new Map<string, string[]>();
  territoryRows.forEach(({ distributorId, market, state }) => {
    const territories = territoriesByDistributor.get(distributorId) ?? [];
    territories.push(`${market}, ${state}`);
    territoriesByDistributor.set(distributorId, territories);
  });

  return (
    <AdminPageShell
      action="Add distributor"
      actionSlot={<AddDistributorDialog />}
      description="Manage the partners responsible for stock and fulfilment."
      icon={Truck}
      label="Distributors"
      title="Distributor network"
    >
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">Active partners</p>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            {distributors.filter((distributor) => distributor.isActive).length}{" "}
            active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Distributor</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Territory</th>
                <th className="px-4 py-3">Minimum order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {distributors.length ? (
                distributors.map((distributor) => (
                  <tr key={distributor.id}>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <Link
                        className="font-medium text-slate-800 hover:text-slate-600 hover:underline"
                        href={`/admin/distributors/${distributor.id}`}
                      >
                        {distributor.businessName}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {distributor.phone}
                      </p>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <p className="text-slate-700">
                        {distributor.ownerName ?? "Unassigned"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {distributor.ownerEmail}
                      </p>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {territoriesByDistributor.get(distributor.id)?.join(" · ") ?? "Not assigned"}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {formatNaira(distributor.minimumOrderKobo ?? 0)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${distributor.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {distributor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-right">
                      <EditDistributorDialog distributor={{
                        id: distributor.id,
                        ownerUserId: distributor.ownerUserId,
                        businessName: distributor.businessName,
                        phone: distributor.phone,
                        ownerName: distributor.ownerName,
                        ownerEmail: distributor.ownerEmail,
                        minimumOrderNaira: ((distributor.minimumOrderKobo ?? 0) / 100).toFixed(2),
                        isActive: distributor.isActive,
                      }} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border-t border-slate-100 px-4 py-10 text-center text-slate-500"
                    colSpan={6}
                  >
                    No distributors have been created yet.
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
