import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
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
import { PARTICIPANTS_BY_LEAGUE_ID } from "@pbd/lib/constants/participants";
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
  const leagueParticipants = PARTICIPANTS_BY_LEAGUE_ID[leagueId] ?? [];

  void Promise.all([
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    queryClient.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    queryClient.prefetchQuery(api.fpl.transactions.queryOptions({ leagueId })),
    queryClient.prefetchQuery(api.fpl.draftChoices.queryOptions({ leagueId })),
    ...leagueParticipants.map((p) =>
      queryClient.prefetchQuery(
        api.fpl.entryHistory.queryOptions({ entryId: p.entryId }),
      ),
    ),
  ]);

  return (
    <HydrateClient>
      <PageTitle title="League" />
      <Suspense fallback={<TableSkeleton />}>
        <LeagueTable leagueId={leagueId} mode="total" />
      </Suspense>
    </HydrateClient>
  );
};

export default LeaguesPage;
