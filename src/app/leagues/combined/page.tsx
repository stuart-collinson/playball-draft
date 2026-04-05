import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { CombinedLeagueTable } from "@pbd/components/LeagueTable/CombinedLeagueTable";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { PageTitle } from "@pbd/components/PageTitle";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { PARTICIPANTS } from "@pbd/lib/constants/participants";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leagues · Combined" };

const CombinedLeaguePage = async (): Promise<JSX.Element> => {
  const queryClient = getQueryClient();

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
      api.fpl.transactions.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.transactions.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.draftChoices.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.draftChoices.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
    ),
    ...PARTICIPANTS.map((p) =>
      queryClient.prefetchQuery(
        api.fpl.entryHistory.queryOptions({ entryId: p.entryId }),
      ),
    ),
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
