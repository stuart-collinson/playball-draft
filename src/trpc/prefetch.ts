import "server-only"

import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { STAT_VIEWS } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import { COMBINED_SCOPE, getLeagueIds } from "@pbd/lib/leagues"
import { api, getQueryClient } from "@pbd/trpc/server"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

const ALL_LEAGUE_IDS = getLeagueIds(COMBINED_SCOPE)

const isBuildTimePrerender = (): boolean => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD

export const prefetchLeagueTableQueries = (leagueIds: number[]): Promise<unknown> => {
  const queryClient = getQueryClient()

  return Promise.all([
    ...LEAGUE_SLUGS.map((slug) =>
      queryClient.prefetchQuery(
        api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID[slug] }),
      ),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    ...leagueIds.flatMap((leagueId) => [
      queryClient.prefetchQuery(api.fpl.currentGwToPlay.queryOptions({ leagueIds: [leagueId] })),
      queryClient.prefetchQuery(
        api.fpl.currentGwGoalsAndAssists.queryOptions({ leagueIds: [leagueId] }),
      ),
      queryClient.prefetchQuery(api.fpl.currentGwPoints.queryOptions({ leagueIds: [leagueId] })),
    ]),
  ])
}

export const prefetchHeaderQueries = (): Promise<unknown> => {
  if (isBuildTimePrerender()) return Promise.resolve()

  const queryClient = getQueryClient()

  return Promise.all([
    queryClient.prefetchQuery(api.fpl.gameState.queryOptions()),
    ...ALL_LEAGUE_IDS.flatMap((leagueId) => [
      queryClient.prefetchQuery(api.fpl.leagueDetails.queryOptions({ leagueId })),
      queryClient.prefetchQuery(
        api.fpl.currentGwGoalsAndAssists.queryOptions({ leagueIds: [leagueId] }),
      ),
      queryClient.prefetchQuery(api.fpl.currentGwPoints.queryOptions({ leagueIds: [leagueId] })),
    ]),
  ])
}

export const prefetchStatQuery = (stat: StatSlug, leagueIds: number[]): Promise<unknown> => {
  const queryClient = getQueryClient()
  const spec = STAT_VIEWS[stat]

  switch (spec.kind) {
    case "leaderboard":
      return queryClient.prefetchQuery(
        api.fpl.gwLeaderboard.queryOptions({ leagueIds, type: spec.type }),
      )
    case "counts":
      return queryClient.prefetchQuery(
        api.fpl.gwCountsTable.queryOptions({ leagueIds, type: spec.type }),
      )
    case "waivers":
      return queryClient.prefetchQuery(
        api.fpl.bestWaivers.queryOptions({
          leagueIds,
          sortBy: spec.sortBy,
          direction: spec.direction,
          minGws: spec.minGws,
          maxGws: spec.maxGws,
          limit: spec.limit,
        }),
      )
    case "trades":
      return queryClient.prefetchQuery(
        api.fpl.bestTrades.queryOptions({ leagueIds, sortBy: spec.sortBy, minGws: spec.minGws }),
      )
    case "positionHistory":
    case "pointsRace":
      return Promise.all(
        leagueIds.map((leagueId) =>
          queryClient.prefetchQuery(
            api.fpl.positionHistory.queryOptions({ leagueIds: [leagueId] }),
          ),
        ),
      )
    case "roundRobin":
      return queryClient.prefetchQuery(api.fpl.roundRobinTable.queryOptions({ leagueIds }))
    case "distribution":
      return queryClient.prefetchQuery(api.fpl.scoreDistributionTable.queryOptions({ leagueIds }))
    case "bench":
      return queryClient.prefetchQuery(api.fpl.benchTable.queryOptions({ leagueIds }))
    case "squadReturns":
      return queryClient.prefetchQuery(api.fpl.squadReturns.queryOptions({ leagueIds }))
    case "form":
      return queryClient.prefetchQuery(api.fpl.formTable.queryOptions({ leagueIds }))
    case "streaks":
      return queryClient.prefetchQuery(api.fpl.streaksTable.queryOptions({ leagueIds }))
    case "pace":
      return queryClient.prefetchQuery(api.fpl.paceTable.queryOptions({ leagueIds }))
    case "rivalry":
      return queryClient.prefetchQuery(api.fpl.rivalryGrid.queryOptions({ leagueIds }))
    case "gotAway":
      return queryClient.prefetchQuery(api.fpl.gotAway.queryOptions({ leagueIds }))
    case "freeAgentXi":
      return queryClient.prefetchQuery(api.fpl.freeAgentXi.queryOptions({ leagueIds }))
    case "survival":
      return queryClient.prefetchQuery(api.survival.list.queryOptions())
  }
}
