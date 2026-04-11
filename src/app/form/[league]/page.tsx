import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { LeagueTable } from "@pbd/components/LeagueTable/index";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { PageTitle } from "@pbd/components/PageTitle";
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
  return { title: `Current Gameweek · ${LEAGUE_LABELS[league]}` };
};

const FormPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params;
  if (!IS_VALID_LEAGUE_SLUG(league)) notFound();

  const leagueId = LEAGUE_SLUG_TO_ID[league as LeagueSlug];
  void getQueryClient().prefetchQuery(
    api.fpl.leagueDetails.queryOptions({ leagueId }),
  );

  return (
    <HydrateClient>
      <PageTitle title="Current Gameweek" />
      <Suspense fallback={<TableSkeleton />}>
        <LeagueTable leagueId={leagueId} mode="form" />
      </Suspense>
    </HydrateClient>
  );
};

export default FormPage;
