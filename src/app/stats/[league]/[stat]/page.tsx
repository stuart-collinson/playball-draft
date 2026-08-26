import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { PageTitle } from "@pbd/components/PageTitle"
import { StatHelp } from "@pbd/components/Stats/StatHelp"
import { StatView } from "@pbd/components/Stats/StatView"
import { StatViewSkeleton } from "@pbd/components/Stats/StatViewSkeleton"
import { EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { IS_VALID_STAT_SLUG, STAT_LABELS } from "@pbd/lib/constants/Stats"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { IS_VALID_LEAGUE_SCOPE, getLeagueIds, getLeagueLabel } from "@pbd/lib/leagues"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ league: string; stat: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league, stat } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !IS_VALID_STAT_SLUG(stat)) return {}
  return { title: `${STAT_LABELS[stat]} · ${getLeagueLabel(league)}` }
}

const StatPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league, stat } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !IS_VALID_STAT_SLUG(stat)) notFound()

  const leagueIds = getLeagueIds(league)
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(api.fpl.gameState.queryOptions())

  void Promise.all(
    LEAGUE_SLUGS.map((slug) =>
      queryClient.prefetchQuery(
        api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID[slug] }),
      ),
    ),
  )

  return (
    <HydrateClient>
      <PageTitle title={STAT_LABELS[stat]} backHref={EXTRA_BACK_HREF} />
      <StatHelp stat={stat} />
      <DataErrorBoundary
        title="Stat Unavailable"
        message="Fantasy Premier League didn't return the data behind this stat."
      >
        <Suspense fallback={<StatViewSkeleton stat={stat} leagueIds={leagueIds} />}>
          <StatView stat={stat} leagueIds={leagueIds} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default StatPage
