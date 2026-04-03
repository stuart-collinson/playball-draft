import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { LeagueTable } from "@pbd/components/LeagueTable/index";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { PageTitleRow } from "@pbd/components/PageTitleRow";
import {
  IS_VALID_LEAGUE_SLUG,
  LEAGUE_LABELS,
  LEAGUE_SLUG_TO_ID,
} from "@pbd/lib/constants/fpl";
import type { LeagueSlug } from "@pbd/lib/constants/fpl";
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
  void getQueryClient().prefetchQuery(
    api.fpl.leagueDetails.queryOptions({ leagueId }),
  );

  return (
    <HydrateClient>
      <PageTitleRow title={`League Table`} />
      <Suspense fallback={<TableSkeleton />}>
        <LeagueTable leagueId={leagueId} mode="total" />
      </Suspense>
    </HydrateClient>
  );
};

export default LeaguesPage;
