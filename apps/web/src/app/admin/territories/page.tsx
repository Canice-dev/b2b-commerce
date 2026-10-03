import { and, asc, eq } from "drizzle-orm";
import { MapPinned } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import {
  distributorProfiles,
  localGovernmentAreas,
  marketDistributorAssignments,
  markets,
  states,
} from "@/db/schema";
import { AddTerritoryDialog } from "./add-territory-dialog";
import { MarketAssignmentEditor } from "./market-assignment-editor";

export default async function TerritoriesPage() {
  const [territories, distributors] = await Promise.all([db
    .select({
      id: markets.id,
      market: markets.name,
      lga: localGovernmentAreas.name,
      state: states.name,
      distributorId: marketDistributorAssignments.distributorId,
      distributor: distributorProfiles.businessName,
      isAssigned: marketDistributorAssignments.isActive,
    })
    .from(markets)
    .innerJoin(
      localGovernmentAreas,
      eq(markets.localGovernmentAreaId, localGovernmentAreas.id),
    )
    .innerJoin(states, eq(localGovernmentAreas.stateId, states.id))
    .leftJoin(
      marketDistributorAssignments,
      and(
        eq(marketDistributorAssignments.marketId, markets.id),
        eq(marketDistributorAssignments.isActive, true),
      ),
    )
    .leftJoin(
      distributorProfiles,
      eq(distributorProfiles.id, marketDistributorAssignments.distributorId),
    )
    .orderBy(
      asc(states.name),
      asc(localGovernmentAreas.name),
      asc(markets.name),
    ), db
    .select({ id: distributorProfiles.id, businessName: distributorProfiles.businessName })
    .from(distributorProfiles)
    .where(eq(distributorProfiles.isActive, true))
    .orderBy(asc(distributorProfiles.businessName))]);
  const stateCount = new Set(territories.map((territory) => territory.state))
    .size;

  return (
    <AdminPageShell
      action="Add territory"
      actionSlot={<AddTerritoryDialog distributors={distributors} />}
      description="Define the markets and service areas your network supports."
      icon={MapPinned}
      label="Territories"
      title="Territory coverage"
    >
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Markets and service assignments
          </p>
          <span className="text-xs text-slate-500">
            {stateCount} states · {territories.length} markets
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">LGA</th>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Assigned distributor</th>
                <th className="px-4 py-3">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {territories.length ? (
                territories.map((territory) => (
                  <tr key={territory.id}>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {territory.state}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {territory.lga}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-800">
                      {territory.market}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      <MarketAssignmentEditor
                        distributorId={territory.distributorId}
                        distributorName={territory.distributor}
                        distributors={distributors}
                        marketId={territory.id}
                      />
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${territory.isAssigned ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {territory.isAssigned ? "Covered" : "Needs assignment"}
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
                    No markets have been configured yet.
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
