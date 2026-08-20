import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton"
import { LeagueTable } from "@pbd/components/LeagueTable/index"
import { PageTitle } from "@pbd/components/PageTitle"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { IS_VALID_LEAGUE_SCOPE, getLeagueIds, getLeagueLabel } from "@pbd/lib/leagues"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Current Gameweek"

type PageProps = {
  params: Promise<{ league: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) return {}
  return { title: `${PAGE_TITLE} · ${getLeagueLabel(league)}` }
}

const GameweekPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) notFound()

  const leagueIds = getLeagueIds(league)
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(api.fpl.gameState.queryOptions())

  void Promise.all([
    ...LEAGUE_SLUGS.map((slug) =>
      queryClient.prefetchQuery(
        api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID[slug] }),
      ),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    ...leagueIds.map((leagueId) =>
      queryClient.prefetchQuery(api.fpl.currentGwToPlay.queryOptions({ leagueIds: [leagueId] })),
    ),
    ...leagueIds.map((leagueId) =>
      queryClient.prefetchQuery(
        api.fpl.currentGwGoalsScored.queryOptions({ leagueIds: [leagueId] }),
      ),
    ),
  ])

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} />
      <DataErrorBoundary
        title="No Gameweek Scores"
        message="Fantasy Premier League didn't return this gameweek's scores."
      >
        <Suspense fallback={<TableSkeleton />}>
          <LeagueStack leagueIds={leagueIds}>
            {(leagueId) => <LeagueTable leagueId={leagueId} mode="form" />}
          </LeagueStack>
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default GameweekPage
