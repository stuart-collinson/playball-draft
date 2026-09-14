import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { LeagueTable } from "@pbd/components/LeagueTable/LeagueTable"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { TableSkeleton } from "@pbd/components/TableSkeleton/TableSkeleton"
import { countParticipants } from "@pbd/lib/constants/Participants"
import type { LeagueTableMode } from "@pbd/lib/fpl/leagueTableRows"
import { prefetchLeagueTableQueries } from "@pbd/trpc/prefetch"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { JSX } from "react"
import { Suspense } from "react"

type Props = {
  leagueIds: number[]
  mode: LeagueTableMode
  title: string
  errorTitle: string
  errorMessage: string
}

export const LeagueTableScreen = async ({
  leagueIds,
  mode,
  title,
  errorTitle,
  errorMessage,
}: Props): Promise<JSX.Element> => {
  await getQueryClient().prefetchQuery(api.fpl.gameState.queryOptions())
  void prefetchLeagueTableQueries(leagueIds)

  return (
    <HydrateClient>
      <PageTitle title={title} />
      <DataErrorBoundary title={errorTitle} message={errorMessage}>
        <Suspense fallback={<TableSkeleton rowCount={countParticipants(leagueIds)} />}>
          <LeagueTable leagueIds={leagueIds} mode={mode} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}
