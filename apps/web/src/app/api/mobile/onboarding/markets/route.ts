import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  distributorProfiles,
  localGovernmentAreas,
  marketDistributorAssignments,
  markets,
  neighbourServiceAssignments,
  states,
} from "@/db/schema";

export async function GET() {
  const marketFields = {
    id: markets.id,
    name: markets.name,
    localGovernmentArea: localGovernmentAreas.name,
    state: states.name,
  };
  const [primaryMarkets, neighbouringMarkets] = await Promise.all([
    db
      .select({
        ...marketFields,
      })
      .from(markets)
      .innerJoin(
        localGovernmentAreas,
        eq(markets.localGovernmentAreaId, localGovernmentAreas.id),
      )
      .innerJoin(states, eq(localGovernmentAreas.stateId, states.id))
      .innerJoin(
        marketDistributorAssignments,
        and(
          eq(marketDistributorAssignments.marketId, markets.id),
          eq(marketDistributorAssignments.isActive, true),
        ),
      )
      .innerJoin(
        distributorProfiles,
        and(
          eq(
            marketDistributorAssignments.distributorId,
            distributorProfiles.id,
          ),
          eq(distributorProfiles.isActive, true),
        ),
      )
      .orderBy(
        asc(states.name),
        asc(localGovernmentAreas.name),
        asc(markets.name),
      ),
    db
      .select(marketFields)
      .from(markets)
      .innerJoin(
        localGovernmentAreas,
        eq(markets.localGovernmentAreaId, localGovernmentAreas.id),
      )
      .innerJoin(states, eq(localGovernmentAreas.stateId, states.id))
      .innerJoin(
        neighbourServiceAssignments,
        and(
          eq(neighbourServiceAssignments.marketId, markets.id),
          eq(neighbourServiceAssignments.isActive, true),
        ),
      )
      .innerJoin(
        distributorProfiles,
        and(
          eq(neighbourServiceAssignments.distributorId, distributorProfiles.id),
          eq(distributorProfiles.isActive, true),
        ),
      )
      .orderBy(
        asc(states.name),
        asc(localGovernmentAreas.name),
        asc(markets.name),
      ),
  ]);

  const availableMarkets = Array.from(
    new Map(
      [...primaryMarkets, ...neighbouringMarkets].map((market) => [
        market.id,
        market,
      ]),
    ).values(),
  );

  return Response.json({ markets: availableMarkets });
}
