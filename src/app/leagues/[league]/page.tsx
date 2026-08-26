import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary";
import { LeagueTable } from "@pbd/components/LeagueTable/index";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { PageTitle } from "@pbd/components/PageTitle";
import {
  IS_VALID_LEAGUE_SLUG,
  LEAGUE_IDS,
  LEAGUE_LABELS,
  LEAGUE_SLUG_TO_ID,
} from "@pbd/lib/constants/fpl";
import type { LeagueSlug } from "@pbd/lib/constants/fpl";
import { PAGE_TITLES } from "@pbd/lib/constants/Pages";
import { countParticipants } from "@pbd/lib/constants/participants";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ league: string }>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { league } = await params;
  if (!IS_VALID_LEAGUE_SLUG(league)) return {};
  return { title: `Leagues · ${LEAGUE_LABELS[league]}` };
};

const LeaguesPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params;
  if (!IS_VALID_LEAGUE_SLUG(league)) notFound();

  const leagueId = LEAGUE_SLUG_TO_ID[league as LeagueSlug];
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(api.fpl.gameState.queryOptions());

  void Promise.all([
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    queryClient.prefetchQuery(
      api.fpl.currentGwToPlay.queryOptions({ leagueIds: [leagueId] }),
    ),
    queryClient.prefetchQuery(
      api.fpl.currentGwGoalsScored.queryOptions({ leagueIds: [leagueId] }),
    ),
  ]);

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLES.leagues} />
      <DataErrorBoundary
        title="No Standings"
        message="Fantasy Premier League didn't return this league's standings."
      >
        <Suspense fallback={<TableSkeleton rowCount={countParticipants([leagueId])} />}>
          <LeagueTable leagueId={leagueId} mode="total" />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  );
};

export default LeaguesPage;
