import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { CombinedLeagueTable } from "@pbd/components/LeagueTable/CombinedLeagueTable";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { PageTitle } from "@pbd/components/PageTitle";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leagues · Combined" };

const CombinedLeaguePage = async (): Promise<JSX.Element> => {
  const queryClient = getQueryClient();

  // CombinedLeagueTable reads three queries; this page used to warm 23,
  // speculatively loading modal data that may never be opened.
  void Promise.all([
    queryClient.prefetchQuery(api.fpl.gameState.queryOptions()),
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({
        leagueId: LEAGUE_SLUG_TO_ID.championship,
      }),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
  ]);

  return (
    <HydrateClient>
      <PageTitle title="League" />
      <Suspense fallback={<TableSkeleton />}>
        <CombinedLeagueTable />
      </Suspense>
    </HydrateClient>
  );
};

export default CombinedLeaguePage;
