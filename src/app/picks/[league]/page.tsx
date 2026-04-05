import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { JSX } from "react";
import { Suspense } from "react";
import { PicksGrid } from "@pbd/components/Picks/PicksGrid";
import { PicksGridSkeleton } from "@pbd/components/Picks/PicksGridSkeleton";
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
  return { title: `Picks · ${LEAGUE_LABELS[league]}` };
};

const PicksPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params;
  if (!IS_VALID_LEAGUE_SLUG(league)) notFound();

  const leagueId = LEAGUE_SLUG_TO_ID[league as LeagueSlug];
  const qc = getQueryClient();

  void Promise.all([
    qc.prefetchQuery(api.fpl.draftChoices.queryOptions({ leagueId })),
    qc.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
  ]);

  return (
    <HydrateClient>
      <PageTitle title="Draft Picks" />
      <Suspense fallback={<PicksGridSkeleton />}>
        <PicksGrid leagueId={leagueId} />
      </Suspense>
    </HydrateClient>
  );
};

export default PicksPage;
