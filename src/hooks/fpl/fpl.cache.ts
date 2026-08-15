import { FRESHNESS } from "@pbd/lib/freshness"
import type { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"

type Trpc = ReturnType<typeof useTRPC>

export const gameStateOptions = (trpc: Trpc) => ({
  ...trpc.fpl.gameState.queryOptions(),
  ...FRESHNESS.live,
})

export const leagueDetailsOptions = (trpc: Trpc, leagueId: number) => ({
  ...trpc.fpl.leagueDetails.queryOptions({ leagueId }),
  ...FRESHNESS.live,
})

export const currentGwToPlayOptions = (trpc: Trpc, leagueIds: number[]) => ({
  ...trpc.fpl.currentGwToPlay.queryOptions({ leagueIds }),
  ...FRESHNESS.live,
})

export const currentGwGoalsScoredOptions = (trpc: Trpc, leagueIds: number[]) => ({
  ...trpc.fpl.currentGwGoalsScored.queryOptions({ leagueIds }),
  ...FRESHNESS.live,
})

export const eventLiveOptions = (trpc: Trpc, eventId: number) => ({
  ...trpc.fpl.eventLive.queryOptions({ eventId }),
  ...FRESHNESS.live,
})

export const entryHistoryOptions = (trpc: Trpc, entryId: number) => ({
  ...trpc.fpl.entryHistory.queryOptions({ entryId }),
  ...FRESHNESS.matchDay,
})

export const entryEventPicksOptions = (trpc: Trpc, entryId: number, eventId: number) => ({
  ...trpc.fpl.entryEventPicks.queryOptions({ entryId, eventId }),
  ...FRESHNESS.matchDay,
})

export const elementSummariesOptions = (trpc: Trpc, elementIds: number[]) => ({
  ...trpc.fpl.elementSummaries.queryOptions({ elementIds }),
  ...FRESHNESS.matchDay,
})

export const transactionsOptions = (trpc: Trpc, leagueId: number) => ({
  ...trpc.fpl.transactions.queryOptions({ leagueId }),
  ...FRESHNESS.matchDay,
})

export const leagueTradesOptions = (trpc: Trpc, leagueId: number) => ({
  ...trpc.fpl.leagueTrades.queryOptions({ leagueId }),
  ...FRESHNESS.matchDay,
})

export const bootstrapStaticOptions = (trpc: Trpc) => ({
  ...trpc.fpl.bootstrapStatic.queryOptions(),
  ...FRESHNESS.gameweek,
})

export const awardsOptions = (trpc: Trpc, leagueIds: number[]) => ({
  ...trpc.fpl.awards.queryOptions({ leagueIds }),
  ...FRESHNESS.gameweek,
})

export const gwLeaderboardOptions = (trpc: Trpc, input: RouterInput["fpl"]["gwLeaderboard"]) => ({
  ...trpc.fpl.gwLeaderboard.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const gwCountsTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["gwCountsTable"]) => ({
  ...trpc.fpl.gwCountsTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const bestWaiversOptions = (trpc: Trpc, input: RouterInput["fpl"]["bestWaivers"]) => ({
  ...trpc.fpl.bestWaivers.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const bestTradesOptions = (trpc: Trpc, input: RouterInput["fpl"]["bestTrades"]) => ({
  ...trpc.fpl.bestTrades.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const positionHistoryOptions = (
  trpc: Trpc,
  input: RouterInput["fpl"]["positionHistory"],
) => ({
  ...trpc.fpl.positionHistory.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const draftChoicesOptions = (trpc: Trpc, leagueId: number) => ({
  ...trpc.fpl.draftChoices.queryOptions({ leagueId }),
  ...FRESHNESS.stable,
})
