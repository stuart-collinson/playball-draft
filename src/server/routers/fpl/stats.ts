import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { buildGwScores, tallyGwExtremes } from "@pbd/lib/fpl/gwScores"
import {
  buildTradeDrops,
  findOwnershipEnd,
  isProcessedTrade,
  sumOwnershipPoints,
} from "@pbd/lib/fpl/ownership"
import { participantDisplayName } from "@pbd/lib/fpl/participants"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { fetchEntryHistories, fetchLeagueEntries } from "@pbd/server/fpl/leagueData"
import type { EntryWithLeague } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  ElementSummaryResponse,
  TradesResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

type GwCountsEntry = {
  rank: number
  managerName: string
  teamName: string
  entryApiId: number
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

type BestWaiverEntry = AcquisitionEntry & { kind: "w" | "f" }

const GW_LEADERBOARD_SIZE = 20

const entryFplName = (entry: EntryWithLeague): string =>
  `${entry.player_first_name} ${entry.player_last_name}`

// Per-gameweek total points for each element, from element summaries. A
// summary that fails to load simply has no entry — callers score it as zero
// rather than failing the whole table.
const fetchElementGwPoints = async (
  elementIds: number[],
): Promise<Map<number, Map<number, number>>> => {
  const summaries = await Promise.all(
    elementIds.map((id) =>
      fetchFplSafe<ElementSummaryResponse>(
        FPL_ENDPOINTS.elementSummary(id),
        SERVER_TTL.ELEMENT_SUMMARY,
      ),
    ),
  )

  const byElement = new Map<number, Map<number, number>>()
  elementIds.forEach((id, index) => {
    const summary = summaries[index]
    if (!summary) return
    byElement.set(id, new Map(summary.history.map((h) => [h.event, h.total_points])))
  })

  return byElement
}

const fetchLeagueTransactions = (leagueIds: number[]): Promise<TransactionsResponse[]> =>
  Promise.all(
    leagueIds.map((id) =>
      fetchFpl<TransactionsResponse>(FPL_ENDPOINTS.transactions(id), SERVER_TTL.TRANSACTIONS),
    ),
  )

const fetchLeagueTrades = (leagueIds: number[]): Promise<TradesResponse[]> =>
  Promise.all(
    leagueIds.map((id) => fetchFpl<TradesResponse>(FPL_ENDPOINTS.trades(id), SERVER_TTL.TRADES)),
  )

export const statsProcedures = {
  gwLeaderboard: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        type: z.enum(["best", "worst"]),
      }),
    )
    .query(async ({ input }): Promise<GwLeaderboardEntry[]> => {
      const { entries, finishedGwSet } = await fetchLeagueEntries(input.leagueIds)
      const histories = await fetchEntryHistories(entries)

      const scores = buildGwScores(entries, histories, finishedGwSet)
      const entryByApiId = new Map(entries.map((entry) => [entry.id, entry]))

      scores.sort((a, b) => (input.type === "best" ? b.points - a.points : a.points - b.points))

      return scores.slice(0, GW_LEADERBOARD_SIZE).map((score, index) => {
        const entry = entryByApiId.get(score.apiId)
        return {
          rank: index + 1,
          managerName: participantDisplayName(
            score.apiId,
            entry ? entryFplName(entry) : `Entry ${score.apiId}`,
          ),
          teamName: entry?.entry_name ?? "",
          event: score.event,
          points: score.points,
          entryApiId: score.apiId,
          leagueId: score.leagueId,
        }
      })
    }),

  gwCountsTable: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        type: z.enum(["relevancy", "gw-wins", "gw-losses"]),
      }),
    )
    .query(async ({ input }): Promise<GwCountsEntry[]> => {
      const { entries, finishedGwSet } = await fetchLeagueEntries(input.leagueIds)
      const histories = await fetchEntryHistories(entries)

      const { wins, lasts } = tallyGwExtremes(buildGwScores(entries, histories, finishedGwSet))

      const rows = entries.map((entry) => ({
        managerName: participantDisplayName(entry.id, entryFplName(entry)),
        teamName: entry.entry_name,
        entryApiId: entry.id,
        gwWins: wins.get(entry.id) ?? 0,
        gwLosses: lasts.get(entry.id) ?? 0,
      }))

      rows.sort((a, b) => {
        if (input.type === "relevancy") return b.gwWins + b.gwLosses - (a.gwWins + a.gwLosses)
        if (input.type === "gw-wins") return b.gwWins - a.gwWins
        return b.gwLosses - a.gwLosses
      })

      return rows.map((row, index) => ({ ...row, rank: index + 1 }))
    }),

  positionHistory: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<PositionHistoryEntry[]> => {
      const { entries, finishedGwSet } = await fetchLeagueEntries(input.leagueIds)
      const histories = await fetchEntryHistories(entries)

      const finishedEvents = [...finishedGwSet].sort((a, b) => a - b)

      const records: PositionHistoryEntry[] = entries.map((entry, index) => {
        const byEvent = new Map(
          (histories[index]?.history ?? []).map((h) => [h.event, h.total_points]),
        )
        return {
          entryApiId: entry.id,
          leagueId: entry.leagueId,
          managerName: participantDisplayName(entry.id, entryFplName(entry)),
          teamName: entry.entry_name,
          history: finishedEvents.map((event) => ({
            event,
            position: 0,
            totalPoints: byEvent.get(event) ?? 0,
          })),
        }
      })

      // League position per finished gameweek, by cumulative total points.
      for (const leagueId of input.leagueIds) {
        const leagueRecords = records.filter((record) => record.leagueId === leagueId)
        for (let eventIndex = 0; eventIndex < finishedEvents.length; eventIndex++) {
          const standings = leagueRecords
            .map((record) => ({ record, total: record.history[eventIndex]?.totalPoints ?? 0 }))
            .sort((a, b) => b.total - a.total)
          standings.forEach(({ record }, rank) => {
            const point = record.history[eventIndex]
            if (point) point.position = rank + 1
          })
        }
      }

      return records
    }),

  bestWaivers: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        sortBy: z.enum(["total", "avg"]).default("total"),
        minGws: z.number().int().positive().optional(),
        maxGws: z.number().int().positive().optional(),
        limit: z.number().int().positive().default(20),
      }),
    )
    .query(async ({ input }): Promise<BestWaiverEntry[]> => {
      const [{ bootstrap, entries, finishedGwSet, currentEvent }, allTxData, allTradesData] =
        await Promise.all([
          fetchLeagueEntries(input.leagueIds),
          fetchLeagueTransactions(input.leagueIds),
          fetchLeagueTrades(input.leagueIds),
        ])

      const allTransactions = allTxData.flatMap((d) => d.transactions)
      const tradeDrops = buildTradeDrops(allTradesData.flatMap((d) => d.trades))

      const pickups = allTransactions.filter(
        (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
      )

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]))
      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]))
      const entryByEntryId = new Map(entries.map((entry) => [entry.entry_id, entry]))

      const elementGwPoints = await fetchElementGwPoints([
        ...new Set(pickups.map((pickup) => pickup.element_in)),
      ])

      const pickupEntries = pickups.map((pickup) => {
        const startGw = pickup.event
        const endGw = findOwnershipEnd(
          pickup.element_in,
          pickup.entry,
          startGw,
          allTransactions,
          tradeDrops,
          currentEvent,
        )
        const droppedEvent = endGw < currentEvent ? endGw + 1 : null

        const { points, gwsOwned } = sumOwnershipPoints(
          elementGwPoints.get(pickup.element_in),
          startGw,
          endGw,
          finishedGwSet,
        )

        const element = elementMap.get(pickup.element_in)
        const owner = entryByEntryId.get(pickup.entry)

        return {
          playerName: element?.web_name ?? `#${pickup.element_in}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName: owner
            ? participantDisplayName(owner.id, entryFplName(owner))
            : `Entry ${pickup.entry}`,
          teamName: owner?.entry_name ?? "",
          acquiredEvent: startGw,
          droppedEvent,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: owner?.id ?? 0,
          leagueId: owner?.leagueId ?? input.leagueIds[0] ?? 0,
          kind: pickup.kind as "w" | "f",
        }
      })

      const filtered = pickupEntries.filter((entry) => {
        if (entry.gwsOwned === 0) return false
        if (input.minGws !== undefined && entry.gwsOwned < input.minGws) return false
        if (input.maxGws !== undefined && entry.gwsOwned > input.maxGws) return false
        return true
      })

      filtered.sort((a, b) =>
        input.sortBy === "avg" ? b.avgPoints - a.avgPoints : b.points - a.points,
      )

      return filtered.slice(0, input.limit)
    }),

  bestTrades: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        sortBy: z.enum(["total", "avg"]).default("total"),
        minGws: z.number().int().positive().optional(),
        limit: z.number().int().positive().default(20),
      }),
    )
    .query(async ({ input }): Promise<AcquisitionEntry[]> => {
      const [{ bootstrap, entries, finishedGwSet, currentEvent }, allTxData, allTradesData] =
        await Promise.all([
          fetchLeagueEntries(input.leagueIds),
          fetchLeagueTransactions(input.leagueIds),
          fetchLeagueTrades(input.leagueIds),
        ])

      const allTransactions = allTxData.flatMap((d) => d.transactions)
      const allTrades = allTradesData.flatMap((d) => d.trades)
      const tradeDrops = buildTradeDrops(allTrades)

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]))
      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]))
      const entryByEntryId = new Map(entries.map((entry) => [entry.entry_id, entry]))

      // Each side of a processed trade acquires the elements the other side
      // gave up. Offered/rejected/vetoed trades never moved anyone.
      type TradeAcquisition = { element: number; entryId: number; event: number }
      const acquisitions: TradeAcquisition[] = allTrades.filter(isProcessedTrade).flatMap((trade) =>
        trade.tradeitem_set.flatMap((item) => [
          { element: item.element_in, entryId: trade.offered_entry, event: trade.event },
          { element: item.element_out, entryId: trade.received_entry, event: trade.event },
        ]),
      )

      const elementGwPoints = await fetchElementGwPoints([
        ...new Set(acquisitions.map((acquisition) => acquisition.element)),
      ])

      const tradeEntries = acquisitions.map((acquisition) => {
        const startGw = acquisition.event
        const endGw = findOwnershipEnd(
          acquisition.element,
          acquisition.entryId,
          startGw,
          allTransactions,
          tradeDrops,
          currentEvent,
        )
        const droppedEvent = endGw < currentEvent ? endGw + 1 : null

        const { points, gwsOwned } = sumOwnershipPoints(
          elementGwPoints.get(acquisition.element),
          startGw,
          endGw,
          finishedGwSet,
        )

        const element = elementMap.get(acquisition.element)
        const owner = entryByEntryId.get(acquisition.entryId)

        return {
          playerName: element?.web_name ?? `#${acquisition.element}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName: owner
            ? participantDisplayName(owner.id, entryFplName(owner))
            : `Entry ${acquisition.entryId}`,
          teamName: owner?.entry_name ?? "",
          acquiredEvent: startGw,
          droppedEvent,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: owner?.id ?? 0,
          leagueId: owner?.leagueId ?? input.leagueIds[0] ?? 0,
        }
      })

      const filtered = tradeEntries.filter((entry) => {
        if (entry.gwsOwned === 0) return false
        if (input.minGws !== undefined && entry.gwsOwned < input.minGws) return false
        return true
      })

      filtered.sort((a, b) =>
        input.sortBy === "avg" ? b.avgPoints - a.avgPoints : b.points - a.points,
      )

      return filtered.slice(0, input.limit)
    }),
} satisfies TRPCRouterRecord
