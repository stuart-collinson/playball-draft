import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { PageTitle } from "@pbd/components/PageTitle";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { AwardsView } from "@pbd/components/Awards/AwardsView";
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

const isValidAwardsSlug = (slug: string): boolean =>
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
  if (!isValidAwardsSlug(league)) return {};
  return { title: `Awards · ${getLeagueLabel(league)}` };
};

const AwardsPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params;
  if (!isValidAwardsSlug(league)) notFound();

  const leagueIds = getLeagueIds(league);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(api.fpl.awards.queryOptions({ leagueIds }));

  return (
    <HydrateClient>
      <PageTitle title="Awards" />
      <Suspense fallback={<TableSkeleton />}>
        <AwardsView leagueIds={leagueIds} />
      </Suspense>
    </HydrateClient>
  );
};

export default AwardsPage;
