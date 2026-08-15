import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID, PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/participants"
import { buildTradeDrops, findOwnershipEnd } from "@pbd/lib/fpl/ownership"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  BootstrapStaticResponse,
  ElementSummaryResponse,
  EntryHistoryResponse,
  LeagueDetailsResponse,
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

type BestWaiverEntry = {
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
  kind: "w" | "f"
}

type BestTradeEntry = {
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

export const statsProcedures = {
  gwLeaderboard: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        type: z.enum(["best", "worst"]),
      }),
    )
    .query(async ({ input }): Promise<GwLeaderboardEntry[]> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              SERVER_TTL.LEAGUE_DETAILS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      )

      const allEntriesWithLeague = allDetails.flatMap((d, i) =>
        d.league_entries.map((e) => ({
          ...e,
          leagueId: input.leagueIds[i] ?? input.leagueIds[0] ?? 0,
        })),
      )

      const histories = await Promise.all(
        allEntriesWithLeague.map((e) =>
          fetchFpl<EntryHistoryResponse>(
            FPL_ENDPOINTS.entryHistory(e.entry_id),
            SERVER_TTL.ENTRY_HISTORY,
          ),
        ),
      )

      const allScores = allEntriesWithLeague.flatMap((entry, i) =>
        (histories[i]?.history ?? [])
          .filter((h) => finishedGwSet.has(h.event))
          .map((h) => ({
            managerName:
              PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
              PARTICIPANT_BY_API_ID[entry.id]?.name ??
              `${entry.player_first_name} ${entry.player_last_name}`,
            teamName: entry.entry_name,
            event: h.event,
            points: h.points,
            entryApiId: entry.id,
            leagueId: entry.leagueId,
          })),
      )

      const sorted =
        input.type === "best"
          ? allScores.sort((a, b) => b.points - a.points)
          : allScores.sort((a, b) => a.points - b.points)

      return sorted.slice(0, 20).map((entry, i) => ({ ...entry, rank: i + 1 }))
    }),

  gwCountsTable: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        type: z.enum(["relevancy", "gw-wins", "gw-losses"]),
      }),
    )
    .query(async ({ input }): Promise<GwCountsEntry[]> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              SERVER_TTL.LEAGUE_DETAILS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((event) => event.finished).map((event) => event.id),
      )

      const allEntriesWithLeague = allDetails.flatMap((details, index) =>
        details.league_entries.map((entry) => ({
          ...entry,
          leagueId: input.leagueIds[index] ?? input.leagueIds[0] ?? 0,
        })),
      )

      const histories = await Promise.all(
        allEntriesWithLeague.map((entry) =>
          fetchFpl<EntryHistoryResponse>(
            FPL_ENDPOINTS.entryHistory(entry.entry_id),
            SERVER_TTL.ENTRY_HISTORY,
          ),
        ),
      )

      type GwScore = {
        apiId: number
        event: number
        points: number
        leagueId: number
      }
      const allGwScores: GwScore[] = allEntriesWithLeague.flatMap((entry, index) =>
        (histories[index]?.history ?? [])
          .filter((hist) => finishedGwSet.has(hist.event))
          .map((hist) => ({
            apiId: entry.id,
            event: hist.event,
            points: hist.points,
            leagueId: entry.leagueId,
          })),
      )

      const scoresByLeagueEvent = new Map<string, GwScore[]>()
      for (const score of allGwScores) {
        const key = `${score.leagueId}-${score.event}`
        if (!scoresByLeagueEvent.has(key)) scoresByLeagueEvent.set(key, [])
        scoresByLeagueEvent.get(key)!.push(score)
      }

      const gwWins = new Map<number, number>()
      const gwLasts = new Map<number, number>()
      for (const scores of scoresByLeagueEvent.values()) {
        const max = Math.max(...scores.map((score) => score.points))
        const min = Math.min(...scores.map((score) => score.points))
        for (const score of scores) {
          if (score.points === max) gwWins.set(score.apiId, (gwWins.get(score.apiId) ?? 0) + 1)
          if (score.points === min) gwLasts.set(score.apiId, (gwLasts.get(score.apiId) ?? 0) + 1)
        }
      }

      const rows = allEntriesWithLeague.map((entry) => {
        const wins = gwWins.get(entry.id) ?? 0
        const losses = gwLasts.get(entry.id) ?? 0
        return {
          managerName:
            PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
            PARTICIPANT_BY_API_ID[entry.id]?.name ??
            `${entry.player_first_name} ${entry.player_last_name}`,
          teamName: entry.entry_name,
          entryApiId: entry.id,
          gwWins: wins,
          gwLosses: losses,
        }
      })

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
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              SERVER_TTL.LEAGUE_DETAILS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const finishedEvents = bootstrap.events.data
        .filter((event) => event.finished)
        .map((event) => event.id)
        .sort((a, b) => a - b)

      const allEntriesWithLeague = allDetails.flatMap((details, index) =>
        details.league_entries.map((entry) => ({
          ...entry,
          leagueId: input.leagueIds[index] ?? input.leagueIds[0] ?? 0,
        })),
      )

      const histories = await Promise.all(
        allEntriesWithLeague.map((entry) =>
          fetchFpl<EntryHistoryResponse>(
            FPL_ENDPOINTS.entryHistory(entry.entry_id),
            SERVER_TTL.ENTRY_HISTORY,
          ),
        ),
      )

      type Cumulative = {
        entryApiId: number
        leagueId: number
        managerName: string
        teamName: string
        history: { event: number; position: number; totalPoints: number }[]
      }

      const records: Cumulative[] = allEntriesWithLeague.map((entry, i) => {
        const hist = histories[i]?.history ?? []
        const byEvent = new Map<number, number>(hist.map((h) => [h.event, h.total_points]))
        return {
          entryApiId: entry.id,
          leagueId: entry.leagueId,
          managerName:
            PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
            PARTICIPANT_BY_API_ID[entry.id]?.name ??
            `${entry.player_first_name} ${entry.player_last_name}`,
          teamName: entry.entry_name,
          history: finishedEvents.map((event) => ({
            event,
            position: 0,
            totalPoints: byEvent.get(event) ?? 0,
          })),
        }
      })

      for (const leagueId of input.leagueIds) {
        const leagueRecords = records.filter((r) => r.leagueId === leagueId)
        for (let i = 0; i < finishedEvents.length; i++) {
          const sorted = leagueRecords
            .map((r) => ({
              entryApiId: r.entryApiId,
              total: r.history[i]?.totalPoints ?? 0,
            }))
            .sort((a, b) => b.total - a.total)
          sorted.forEach((s, rank) => {
            const rec = leagueRecords.find((r) => r.entryApiId === s.entryApiId)
            const point = rec?.history[i]
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
        minGws: z.number().int().nonnegative().optional(),
        maxGws: z.number().int().positive().optional(),
        limit: z.number().int().positive().default(20),
      }),
    )
    .query(async ({ input }): Promise<BestWaiverEntry[]> => {
      const [allTxData, allTradesData, allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<TransactionsResponse>(FPL_ENDPOINTS.transactions(id), SERVER_TTL.TRANSACTIONS),
          ),
        ),
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<TradesResponse>(FPL_ENDPOINTS.trades(id), SERVER_TTL.TRADES),
          ),
        ),
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              SERVER_TTL.LEAGUE_DETAILS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const allTransactions = allTxData.flatMap((d) => d.transactions)
      const allTrades = allTradesData.flatMap((d) => d.trades)
      const tradeDrops = buildTradeDrops(allTrades)

      const pickups = allTransactions.filter(
        (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
      )

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      )
      const currentEvent = bootstrap.events.current

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]))
      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]))
      const entryNameMap = new Map(
        allDetails.flatMap((d) => d.league_entries.map((e) => [e.entry_id, e.entry_name])),
      )

      const uniqueElementIds = [...new Set(pickups.map((w) => w.element_in))]

      const summaryResults = await Promise.all(
        uniqueElementIds.map((id) =>
          fetchFplSafe<ElementSummaryResponse>(
            FPL_ENDPOINTS.elementSummary(id),
            SERVER_TTL.ELEMENT_SUMMARY,
          ),
        ),
      )

      const elementGwPoints = new Map<number, Map<number, number>>()
      uniqueElementIds.forEach((id, i) => {
        const summary = summaryResults[i]
        if (!summary) return
        const gwMap = new Map<number, number>()
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points))
        elementGwPoints.set(id, gwMap)
      })

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

        const gwPoints = elementGwPoints.get(pickup.element_in)
        let points = 0
        let gwsOwned = 0
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGwSet.has(gw)) {
            points += gwPoints?.get(gw) ?? 0
            gwsOwned++
          }
        }

        const element = elementMap.get(pickup.element_in)
        const participant = PARTICIPANT_BY_ENTRY_ID[pickup.entry]

        return {
          playerName: element?.web_name ?? `#${pickup.element_in}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName: participant?.nickname ?? participant?.name ?? `Entry ${pickup.entry}`,
          teamName: entryNameMap.get(pickup.entry) ?? "",
          acquiredEvent: startGw,
          droppedEvent,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: participant?.apiId ?? 0,
          leagueId: participant?.leagueId ?? input.leagueIds[0] ?? 0,
          kind: pickup.kind as "w" | "f",
        }
      })

      const filtered = pickupEntries.filter((e) => {
        if (e.gwsOwned === 0) return false
        if (input.minGws !== undefined && e.gwsOwned < input.minGws) return false
        if (input.maxGws !== undefined && e.gwsOwned > input.maxGws) return false
        return true
      })

      const sorted =
        input.sortBy === "avg"
          ? filtered.sort((a, b) => b.avgPoints - a.avgPoints)
          : filtered.sort((a, b) => b.points - a.points)

      return sorted.slice(0, input.limit)
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
    .query(async ({ input }): Promise<BestTradeEntry[]> => {
      const [allTxData, allTradesData, allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<TransactionsResponse>(FPL_ENDPOINTS.transactions(id), SERVER_TTL.TRANSACTIONS),
          ),
        ),
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<TradesResponse>(FPL_ENDPOINTS.trades(id), SERVER_TTL.TRADES),
          ),
        ),
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              SERVER_TTL.LEAGUE_DETAILS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const allTransactions = allTxData.flatMap((d) => d.transactions)
      const allTrades = allTradesData.flatMap((d) => d.trades)
      const tradeDrops = buildTradeDrops(allTrades)

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      )
      const currentEvent = bootstrap.events.current

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]))
      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]))
      const entryNameMap = new Map(
        allDetails.flatMap((d) => d.league_entries.map((e) => [e.entry_id, e.entry_name])),
      )

      type TradeAcquisition = {
        element: number
        entryId: number
        event: number
      }
      const acquisitions: TradeAcquisition[] = []
      for (const trade of allTrades) {
        for (const item of trade.tradeitem_set) {
          acquisitions.push({
            element: item.element_in,
            entryId: trade.offered_entry,
            event: trade.event,
          })
          acquisitions.push({
            element: item.element_out,
            entryId: trade.received_entry,
            event: trade.event,
          })
        }
      }

      const uniqueElementIds = [...new Set(acquisitions.map((a) => a.element))]

      const summaryResults = await Promise.all(
        uniqueElementIds.map((id) =>
          fetchFplSafe<ElementSummaryResponse>(
            FPL_ENDPOINTS.elementSummary(id),
            SERVER_TTL.ELEMENT_SUMMARY,
          ),
        ),
      )

      const elementGwPoints = new Map<number, Map<number, number>>()
      uniqueElementIds.forEach((id, i) => {
        const summary = summaryResults[i]
        if (!summary) return
        const gwMap = new Map<number, number>()
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points))
        elementGwPoints.set(id, gwMap)
      })

      const tradeEntries = acquisitions.map((acq) => {
        const startGw = acq.event
        const endGw = findOwnershipEnd(
          acq.element,
          acq.entryId,
          startGw,
          allTransactions,
          tradeDrops,
          currentEvent,
        )
        const droppedEvent = endGw < currentEvent ? endGw + 1 : null

        const gwPoints = elementGwPoints.get(acq.element)
        let points = 0
        let gwsOwned = 0
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGwSet.has(gw)) {
            points += gwPoints?.get(gw) ?? 0
            gwsOwned++
          }
        }

        const element = elementMap.get(acq.element)
        const participant = PARTICIPANT_BY_ENTRY_ID[acq.entryId]

        return {
          playerName: element?.web_name ?? `#${acq.element}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName: participant?.nickname ?? participant?.name ?? `Entry ${acq.entryId}`,
          teamName: entryNameMap.get(acq.entryId) ?? "",
          acquiredEvent: startGw,
          droppedEvent,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: participant?.apiId ?? 0,
          leagueId: participant?.leagueId ?? input.leagueIds[0] ?? 0,
        }
      })

      return tradeEntries
        .filter((e) => e.gwsOwned > 0 && (!input.minGws || e.gwsOwned >= input.minGws))
        .sort((a, b) => (input.sortBy === "avg" ? b.avgPoints - a.avgPoints : b.points - a.points))
        .slice(0, input.limit)
    }),
} satisfies TRPCRouterRecord
