import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/Participants"
import { STAT_TABLE_ROW_LIMIT } from "@pbd/lib/constants/Stats"
import { computeGameweekCounts } from "@pbd/lib/fpl/gameweekCounts"
import {
  buildTradeAcquisitions,
  buildTradeDrops,
  findOwnershipEnd,
  isAcceptedPickup,
  sumPointsWhileOwned,
} from "@pbd/lib/fpl/ownership"
import type { OwnershipRecord, PickupKind } from "@pbd/lib/fpl/ownership"
import { computeStandingsHistory } from "@pbd/lib/fpl/standingsHistory"
import { managerNameForEntryId } from "@pbd/lib/people"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
import { fetchElementGameweekPoints } from "@pbd/server/fpl/elementPoints"
import type { ElementGameweekPoints } from "@pbd/server/fpl/elementPoints"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import {
  fetchLeagueDetails,
  fetchLeagueTrades,
  fetchLeagueTransactions,
} from "@pbd/server/fpl/leagueData"
import { buildMetaLookup, fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { FplElement, Trade, Transaction } from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

type GwCountsEntry = {
  rank: number
  managerName: string
  teamName: string
  entryApiId: number
  leagueId: number
  gwWins: number
  gwLosses: number
}

type GwLeaderboardEntry = {
  rank: number
  managerName: string
  teamName: string
  event: number
  points: number
  entryApiId: number
  leagueId: number
}

type PositionHistoryEntry = {
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  history: { event: number; position: number; totalPoints: number }[]
}

type AcquisitionEntry = {
  playerName: string
  playerTeam: string
  managerName: string
  teamName: string
  acquiredEvent: number
  droppedEvent: number | null
  points: number
  avgPoints: number
  gwsOwned: number
  entryApiId: number
  leagueId: number
}

type BestWaiverEntry = AcquisitionEntry & { kind: PickupKind }

type AcquisitionContext = {
  transactions: Transaction[]
  trades: Trade[]
  tradeDrops: OwnershipRecord[]
  finishedGws: Set<number>
  currentEvent: number
  elementMap: Map<number, FplElement>
  teamMap: Map<number, string>
  entryNameMap: Map<number, string>
  fallbackLeagueId: number
}

const sortByInput = z.enum(["total", "avg"]).default("total")

const limitInput = z.number().int().positive().default(STAT_TABLE_ROW_LIMIT)

const fetchAcquisitionContext = async (leagueIds: number[]): Promise<AcquisitionContext> => {
  const [allTxData, allTradesData, allDetails, bootstrap] = await Promise.all([
    Promise.all(leagueIds.map(fetchLeagueTransactions)),
    Promise.all(leagueIds.map(fetchLeagueTrades)),
    Promise.all(leagueIds.map(fetchLeagueDetails)),
    fetchBootstrapStatic(),
  ])
  const trades = allTradesData.flatMap((data) => data.trades)

  return {
    transactions: allTxData.flatMap((data) => data.transactions),
    trades,
    tradeDrops: buildTradeDrops(trades),
    finishedGws: new Set(finishedEventIds(bootstrap)),
    currentEvent: bootstrap.events.current ?? 0,
    elementMap: new Map(bootstrap.elements.map((element) => [element.id, element])),
    teamMap: new Map(bootstrap.teams.map((team) => [team.id, team.short_name])),
    entryNameMap: new Map(
      allDetails.flatMap((details) =>
        details.league_entries.map((entry) => [entry.entry_id, entry.entry_name]),
      ),
    ),
    fallbackLeagueId: leagueIds[0] ?? 0,
  }
}

const scoreAcquisition = (
  context: AcquisitionContext,
  acquisition: OwnershipRecord,
  elementGwPoints: ElementGameweekPoints,
): AcquisitionEntry => {
  const endGw = findOwnershipEnd(
    acquisition.element,
    acquisition.entryId,
    acquisition.event,
    context.transactions,
    context.tradeDrops,
    context.currentEvent,
  )
  const { points, gwsOwned } = sumPointsWhileOwned(
    acquisition.event,
    endGw,
    elementGwPoints.get(acquisition.element),
    context.finishedGws,
  )
  const element = context.elementMap.get(acquisition.element)
  const participant = PARTICIPANT_BY_ENTRY_ID[acquisition.entryId]

  return {
    playerName: element?.web_name ?? `#${acquisition.element}`,
    playerTeam: element ? (context.teamMap.get(element.team) ?? "") : "",
    managerName: managerNameForEntryId(acquisition.entryId, `Entry ${acquisition.entryId}`),
    teamName: context.entryNameMap.get(acquisition.entryId) ?? "",
    acquiredEvent: acquisition.event,
    droppedEvent: endGw < context.currentEvent ? endGw + 1 : null,
    points,
    avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
    gwsOwned,
    entryApiId: participant?.apiId ?? 0,
    leagueId: participant?.leagueId ?? context.fallbackLeagueId,
  }
}

export const statsProcedures = {
  gwLeaderboard: publicProcedure
    .input(leagueIdsInput.extend({ type: z.enum(["best", "worst"]) }))
    .query(async ({ input }): Promise<GwLeaderboardEntry[]> => {
      const season = await fetchSeasonScores(input.leagueIds)
      if (season.finishedEvents.length === 0) return []

      const scores = season.entries.flatMap((entry) =>
        entry.rows.map((row) => ({
          managerName: entry.managerName,
          teamName: entry.teamName,
          event: row.event,
          points: row.points,
          entryApiId: entry.entryApiId,
          leagueId: entry.leagueId,
        })),
      )

      const sorted = scores.sort((a, b) =>
        input.type === "best" ? b.points - a.points : a.points - b.points,
      )

      return sorted.slice(0, STAT_TABLE_ROW_LIMIT).map((entry, i) => ({ ...entry, rank: i + 1 }))
    }),

  gwCountsTable: publicProcedure
    .input(leagueIdsInput.extend({ type: z.enum(["relevancy", "gw-wins", "gw-losses"]) }))
    .query(async ({ input }): Promise<GwCountsEntry[]> => {
      const { verdicts, season } = await fetchGameweekVerdicts(input.leagueIds)
      if (verdicts.length === 0) return []

      const countsByEntry = new Map(
        computeGameweekCounts(verdicts).map((count) => [count.entryApiId, count]),
      )

      const rows = season.entries.map((entry) => ({
        managerName: entry.managerName,
        teamName: entry.teamName,
        entryApiId: entry.entryApiId,
        leagueId: entry.leagueId,
        gwWins: countsByEntry.get(entry.entryApiId)?.gwWins ?? 0,
        gwLosses: countsByEntry.get(entry.entryApiId)?.gwLosses ?? 0,
      }))

      const sorted = rows.sort((a, b) => {
        if (input.type === "relevancy") return b.gwWins + b.gwLosses - (a.gwWins + a.gwLosses)
        if (input.type === "gw-wins") return b.gwWins - a.gwWins
        return b.gwLosses - a.gwLosses
      })

      return sorted.map((row, i) => ({ ...row, rank: i + 1 }))
    }),

  positionHistory: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<PositionHistoryEntry[]> => {
      const season = await fetchSeasonScores(input.leagueIds)
      if (season.finishedEvents.length === 0) return []

      const meta = buildMetaLookup(season.entries)

      return computeStandingsHistory(
        season.entries.map((entry) => ({
          entryApiId: entry.entryApiId,
          leagueId: entry.leagueId,
          totalsByEvent: new Map(entry.rows.map((row) => [row.event, row.totalPoints])),
        })),
        season.finishedEvents,
      ).map((row) => ({
        ...meta(row.entryApiId),
        leagueId: row.leagueId,
        history: row.history,
      }))
    }),

  bestWaivers: publicProcedure
    .input(
      leagueIdsInput.extend({
        sortBy: sortByInput,
        direction: z.enum(["best", "worst"]).default("best"),
        minGws: z.number().int().nonnegative().optional(),
        maxGws: z.number().int().positive().optional(),
        limit: limitInput,
      }),
    )
    .query(async ({ input }): Promise<BestWaiverEntry[]> => {
      const context = await fetchAcquisitionContext(input.leagueIds)
      const pickups = context.transactions.filter(isAcceptedPickup)
      const elementGwPoints = await fetchElementGameweekPoints([
        ...new Set(pickups.map((pickup) => pickup.element_in)),
      ])

      const entries = pickups.map((pickup) => ({
        ...scoreAcquisition(
          context,
          { element: pickup.element_in, entryId: pickup.entry, event: pickup.event },
          elementGwPoints,
        ),
        kind: pickup.kind,
      }))

      const filtered = entries.filter((entry) => {
        if (entry.gwsOwned === 0) return false
        if (input.minGws !== undefined && entry.gwsOwned < input.minGws) return false
        if (input.maxGws !== undefined && entry.gwsOwned > input.maxGws) return false
        return true
      })

      const orderedByDirection = (a: number, b: number): number =>
        input.direction === "worst" ? a - b : b - a
      const sorted = filtered.sort((a, b) =>
        input.sortBy === "avg"
          ? orderedByDirection(a.avgPoints, b.avgPoints)
          : orderedByDirection(a.points, b.points),
      )

      return sorted.slice(0, input.limit)
    }),

  bestTrades: publicProcedure
    .input(
      leagueIdsInput.extend({
        sortBy: sortByInput,
        minGws: z.number().int().positive().optional(),
        limit: limitInput,
      }),
    )
    .query(async ({ input }): Promise<AcquisitionEntry[]> => {
      const context = await fetchAcquisitionContext(input.leagueIds)
      const acquisitions = buildTradeAcquisitions(context.trades)
      const elementGwPoints = await fetchElementGameweekPoints([
        ...new Set(acquisitions.map((acquisition) => acquisition.element)),
      ])

      return acquisitions
        .map((acquisition) => scoreAcquisition(context, acquisition, elementGwPoints))
        .filter((entry) => entry.gwsOwned > 0 && (!input.minGws || entry.gwsOwned >= input.minGws))
        .sort((a, b) => (input.sortBy === "avg" ? b.avgPoints - a.avgPoints : b.points - a.points))
        .slice(0, input.limit)
    }),
} satisfies TRPCRouterRecord
