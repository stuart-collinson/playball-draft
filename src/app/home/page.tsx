import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary";
import { GameweekResults } from "@pbd/components/GameweekResults";
import { GameweekResultsSkeleton } from "@pbd/components/GameweekResultsSkeleton";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { HomeHero } from "@pbd/components/HomeHero/HomeHero";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Home" };

const HomePage = async (): Promise<JSX.Element> => {
  const qc = getQueryClient();
  await qc.prefetchQuery(api.fpl.gameState.queryOptions());

  void Promise.all([
    qc.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    qc.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({
        leagueId: LEAGUE_SLUG_TO_ID.championship,
      }),
    ),
    qc.prefetchQuery(
      api.fpl.currentGwGoalsScored.queryOptions({
        leagueIds: [LEAGUE_IDS.PREMIERSHIP],
      }),
    ),
    qc.prefetchQuery(
      api.fpl.currentGwGoalsScored.queryOptions({
        leagueIds: [LEAGUE_SLUG_TO_ID.championship],
      }),
    ),
  ]);

  return (
    <HydrateClient>
      <div className="flex flex-col gap-4">
        <HomeHero />

        <DataErrorBoundary
          title="No Results Yet"
          message="Fantasy Premier League didn't return this gameweek's results."
        >
          <Suspense fallback={<GameweekResultsSkeleton />}>
            <GameweekResults />
          </Suspense>
        </DataErrorBoundary>
      </div>
    </HydrateClient>
  );
};

export default HomePage;
