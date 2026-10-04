import { and, eq } from "drizzle-orm";
import { MapPinned } from "lucide-react";
import { db } from "@/db";
import {
  localGovernmentAreas,
  marketDistributorAssignments,
  markets,
  states,
} from "@/db/schema";
import { DataTable, PortalPage } from "../_components/portal-page";
import { getPortalDistributor } from "../_components/data";

export default async function ServiceAreasPage() {
  const distributor = await getPortalDistributor();
  if (!distributor) return null;
  const areas = await db
    .select({
      market: markets.name,
      lga: localGovernmentAreas.name,
      state: states.name,
      startsAt: marketDistributorAssignments.startsAt,
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
    );
  return (
    <PortalPage
      description="Markets assigned to your distribution business."
      icon={MapPinned}
      title="Service areas"
    >
      <DataTable
        headers={["Market", "Local government", "State", "Assigned from"]}
      >
        {areas.length ? (
          areas.map((area) => (
            <tr key={`${area.market}-${area.lga}`}>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-700">
                {area.market}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {area.lga}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {area.state}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {new Intl.DateTimeFormat("en-NG", {
                  dateStyle: "medium",
                }).format(area.startsAt)}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500"
              colSpan={4}
            >
              No service areas have been assigned yet.
            </td>
          </tr>
        )}
      </DataTable>
    </PortalPage>
  );
}
