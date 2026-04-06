import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { PageTitle } from "@pbd/components/PageTitle";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { StatsView } from "@pbd/components/Stats/StatsView";
import {
  IS_VALID_LEAGUE_SLUG,
  LEAGUE_IDS,
  LEAGUE_LABELS,
  LEAGUE_SLUG_TO_ID,
} from "@pbd/lib/constants/fpl";
import type { LeagueSlug } from "@pbd/lib/constants/fpl";
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ league: string }>;
};

const COMBINED_LEAGUE_IDS = [
  LEAGUE_IDS.PREMIERSHIP,
  LEAGUE_IDS.CHAMPIONSHIP,
] as const;

const isValidStatsSlug = (slug: string): boolean =>
  IS_VALID_LEAGUE_SLUG(slug) || slug === "combined";

const getLeagueIds = (slug: string): number[] =>
  slug === "combined"
    ? [...COMBINED_LEAGUE_IDS]
    : [LEAGUE_SLUG_TO_ID[slug as LeagueSlug]];

const getLeagueLabel = (slug: string): string =>
  slug === "combined" ? "Combined" : LEAGUE_LABELS[slug as LeagueSlug];

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { league } = await params;
  if (!isValidStatsSlug(league)) return {};
  return { title: `Stats · ${getLeagueLabel(league)}` };
};

const StatsPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params;
  if (!isValidStatsSlug(league)) notFound();

  const leagueIds = getLeagueIds(league);

  const qc = getQueryClient();
  void Promise.all([
    qc.prefetchQuery(
      api.fpl.gwLeaderboard.queryOptions({ leagueIds, type: "worst" }),
    ),
    qc.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
    ),
    qc.prefetchQuery(
      api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
    ),
  ]);

  return (
    <HydrateClient>
      <PageTitle title="Stats" />
      <Suspense fallback={<TableSkeleton />}>
        <StatsView leagueIds={leagueIds} />
      </Suspense>
    </HydrateClient>
  );
};

export default StatsPage;
