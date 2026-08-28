import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary";
import { CombinedLeagueTable } from "@pbd/components/LeagueTable/CombinedLeagueTable";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { PageTitle } from "@pbd/components/PageTitle";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { PAGE_TITLES } from "@pbd/lib/constants/Pages";
import { countParticipants } from "@pbd/lib/constants/participants";
import { COMBINED_SCOPE, getLeagueIds } from "@pbd/lib/leagues";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leagues · Combined" };

const CombinedLeaguePage = async (): Promise<JSX.Element> => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(api.fpl.gameState.queryOptions());

  void Promise.all([
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({
        leagueId: LEAGUE_SLUG_TO_ID.championship,
      }),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    queryClient.prefetchQuery(
      api.fpl.currentGwPoints.queryOptions({ leagueIds: [LEAGUE_IDS.PREMIERSHIP] }),
    ),
    queryClient.prefetchQuery(
      api.fpl.currentGwPoints.queryOptions({ leagueIds: [LEAGUE_IDS.CHAMPIONSHIP] }),
    ),
  ]);

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLES.leagues} />
      <DataErrorBoundary
        title="No Standings"
        message="Fantasy Premier League didn't return the combined standings."
      >
        <Suspense
          fallback={<TableSkeleton rowCount={countParticipants(getLeagueIds(COMBINED_SCOPE))} />}
        >
          <CombinedLeagueTable />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  );
};

export default CombinedLeaguePage;
