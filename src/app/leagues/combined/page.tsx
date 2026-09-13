import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton"
import { LeagueTable } from "@pbd/components/LeagueTable/index"
import { PageTitle } from "@pbd/components/PageTitle"
import { PAGE_TITLES } from "@pbd/lib/constants/Pages"
import { countParticipants } from "@pbd/lib/constants/participants"
import { COMBINED_SCOPE, getLeagueIds } from "@pbd/lib/leagues"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Leagues · Combined" }

const CombinedLeaguePage = async (): Promise<JSX.Element> => {
  const leagueIds = getLeagueIds(COMBINED_SCOPE)
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(api.fpl.gameState.queryOptions())

  void Promise.all([
    ...leagueIds.map((leagueId) =>
      queryClient.prefetchQuery(api.fpl.leagueDetails.queryOptions({ leagueId })),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    ...leagueIds.map((leagueId) =>
      queryClient.prefetchQuery(api.fpl.currentGwToPlay.queryOptions({ leagueIds: [leagueId] })),
    ),
    ...leagueIds.map((leagueId) =>
      queryClient.prefetchQuery(
        api.fpl.currentGwGoalsAndAssists.queryOptions({ leagueIds: [leagueId] }),
      ),
    ),
    ...leagueIds.map((leagueId) =>
      queryClient.prefetchQuery(api.fpl.currentGwPoints.queryOptions({ leagueIds: [leagueId] })),
    ),
  ])

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLES.leagues} />
      <DataErrorBoundary
        title="No Standings"
        message="Fantasy Premier League didn't return the combined standings."
      >
        <Suspense fallback={<TableSkeleton rowCount={countParticipants(leagueIds)} />}>
          <LeagueTable leagueIds={leagueIds} mode="total" />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default CombinedLeaguePage
