import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { buildTradeDrops, findOwnershipEnd } from "@pbd/lib/fpl/ownership"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  BootstrapStaticResponse,
  DraftChoicesResponse,
  ElementSummaryResponse,
  EntryHistoryResponse,
  LeagueDetailsResponse,
  TradesResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"

type AwardEntry = {
  managerName: string
  teamName: string
  entryApiId: number
  leagueId: number
  value: number
  extra?: string
}

type AwardsData = {
  mostPoints: AwardEntry
  leastPoints: AwardEntry
  mostGwWins: AwardEntry
  mostGwLasts: AwardEntry
  mostRelevant: AwardEntry
  leastRelevant: AwardEntry
  highestGwScore: AwardEntry
  lowestGwScore: AwardEntry
  bestWaiver: AwardEntry
  highestNetGain: AwardEntry
  mostWaivers: AwardEntry
  bestTrade: AwardEntry
  mostTrades: AwardEntry
  mostFreeAgents: AwardEntry
}

export const awardsProcedures = {
  awards: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<AwardsData | null> => {
      const [allDetails, bootstrap, allTxData, allTradesData, allChoicesData] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              SERVER_TTL.LEAGUE_DETAILS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
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
            fetchFpl<DraftChoicesResponse>(
              FPL_ENDPOINTS.draftChoices(id),
              SERVER_TTL.DRAFT_CHOICES,
            ),
          ),
        ),
      ])

      const finishedGws = new Set(bootstrap.events.data.filter((e) => e.finished).map((e) => e.id))

      const hasStandings = allDetails.some((details) => details.standings.length > 0)
      if (!hasStandings || finishedGws.size === 0) return null

      const allEntries = allDetails.flatMap((d, i) =>
        d.league_entries.map((e) => ({
          ...e,
          leagueId: input.leagueIds[i] ?? 0,
        })),
      )

      const allTransactions = allTxData.flatMap((d) => d.transactions)
      const allTrades = allTradesData.flatMap((d) => d.trades)
      const awardsTradeDrops = buildTradeDrops(allTrades)

      const acceptedPickups = allTransactions.filter(
        (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
      )
      const pickupElementIds = [...new Set(acceptedPickups.map((t) => t.element_in))]

      type TradeAcquisition = {
        element: number
        entryId: number
        event: number
      }
      const tradeAcquisitions: TradeAcquisition[] = []
      for (const trade of allTrades) {
        for (const item of trade.tradeitem_set) {
          tradeAcquisitions.push({
            element: item.element_in,
            entryId: trade.offered_entry,
            event: trade.event,
          })
          tradeAcquisitions.push({
            element: item.element_out,
            entryId: trade.received_entry,
            event: trade.event,
          })
        }
      }
      const tradeElementIds = [...new Set(tradeAcquisitions.map((a) => a.element))]
      const allElementIds = [...new Set([...pickupElementIds, ...tradeElementIds])]

      const [histories, summaryResults] = await Promise.all([
        Promise.all(
          allEntries.map((e) =>
            fetchFpl<EntryHistoryResponse>(
              FPL_ENDPOINTS.entryHistory(e.entry_id),
              SERVER_TTL.ENTRY_HISTORY,
            ),
          ),
        ),
        Promise.all(
          allElementIds.map((id) =>
            fetchFplSafe<ElementSummaryResponse>(
              FPL_ENDPOINTS.elementSummary(id),
              SERVER_TTL.ELEMENT_SUMMARY,
            ),
          ),
        ),
      ])

      const currentEvent = bootstrap.events.current
      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]))

      const entryApiIdToLeagueId = new Map(allEntries.map((e) => [e.id, e.leagueId]))

      const resolveManager = (apiId: number, entryName: string) => {
        const p = PARTICIPANT_BY_API_ID[apiId]
        return {
          managerName: p?.nickname ?? p?.name ?? entryName,
          teamName: entryName,
          entryApiId: apiId,
          leagueId: entryApiIdToLeagueId.get(apiId) ?? input.leagueIds[0] ?? 0,
        }
      }

      const standingsFlat = allDetails.flatMap((d) =>
        d.standings.map((s) => {
          const entry = d.league_entries.find((e) => e.id === s.league_entry)
          return {
            ...resolveManager(s.league_entry, entry?.entry_name ?? "Unknown"),
            total: s.total,
          }
        }),
      )
      const byTotal = [...standingsFlat].sort((a, b) => b.total - a.total)
      const mostPoints: AwardEntry = {
        ...byTotal[0]!,
        value: byTotal[0]!.total,
      }
      const leastPoints: AwardEntry = {
        ...byTotal[byTotal.length - 1]!,
        value: byTotal[byTotal.length - 1]!.total,
      }

      type GwScore = {
        apiId: number
        event: number
        points: number
        leagueId: number
      }
      const allGwScores: GwScore[] = allEntries.flatMap((entry, i) =>
        (histories[i]?.history ?? [])
          .filter((h) => finishedGws.has(h.event))
          .map((h) => ({
            apiId: entry.id,
            event: h.event,
            points: h.points,
            leagueId: entry.leagueId,
          })),
      )

      const scoresByLeagueEvent = new Map<string, GwScore[]>()
      for (const s of allGwScores) {
        const key = `${s.leagueId}-${s.event}`
        if (!scoresByLeagueEvent.has(key)) scoresByLeagueEvent.set(key, [])
        scoresByLeagueEvent.get(key)!.push(s)
      }

      const gwWins = new Map<number, number>()
      const gwLasts = new Map<number, number>()
      for (const scores of scoresByLeagueEvent.values()) {
        const max = Math.max(...scores.map((s) => s.points))
        const min = Math.min(...scores.map((s) => s.points))
        for (const s of scores) {
          if (s.points === max) gwWins.set(s.apiId, (gwWins.get(s.apiId) ?? 0) + 1)
          if (s.points === min) gwLasts.set(s.apiId, (gwLasts.get(s.apiId) ?? 0) + 1)
        }
      }

      const topGwWinApiId = [...gwWins.entries()].sort((a, b) => b[1] - a[1])[0]!
      const topGwLastApiId = [...gwLasts.entries()].sort((a, b) => b[1] - a[1])[0]!

      const gwWinEntry = allEntries.find((e) => e.id === topGwWinApiId[0])!
      const gwLastEntry = allEntries.find((e) => e.id === topGwLastApiId[0])!
      const mostGwWins: AwardEntry = {
        ...resolveManager(gwWinEntry.id, gwWinEntry.entry_name),
        value: topGwWinApiId[1],
      }
      const mostGwLasts: AwardEntry = {
        ...resolveManager(gwLastEntry.id, gwLastEntry.entry_name),
        value: topGwLastApiId[1],
      }

      const relevancyByApiId = new Map<number, number>()
      for (const entry of allEntries) {
        const wins = gwWins.get(entry.id) ?? 0
        const losses = gwLasts.get(entry.id) ?? 0
        relevancyByApiId.set(entry.id, wins + losses)
      }
      const sortedByRelevancy = [...relevancyByApiId.entries()].sort((a, b) => b[1] - a[1])
      const topRelevantApiId = sortedByRelevancy[0]!
      const bottomRelevantApiId = sortedByRelevancy[sortedByRelevancy.length - 1]!
      const topRelevantEntry = allEntries.find((entry) => entry.id === topRelevantApiId[0])!
      const bottomRelevantEntry = allEntries.find((entry) => entry.id === bottomRelevantApiId[0])!
      const mostRelevant: AwardEntry = {
        ...resolveManager(topRelevantEntry.id, topRelevantEntry.entry_name),
        value: topRelevantApiId[1],
      }
      const leastRelevant: AwardEntry = {
        ...resolveManager(bottomRelevantEntry.id, bottomRelevantEntry.entry_name),
        value: bottomRelevantApiId[1],
      }

      const sortedScores = [...allGwScores].sort((a, b) => b.points - a.points)
      const highestRaw = sortedScores[0]!
      const lowestRaw = sortedScores[sortedScores.length - 1]!
      const highestEntry = allEntries.find((e) => e.id === highestRaw.apiId)!
      const lowestEntry = allEntries.find((e) => e.id === lowestRaw.apiId)!
      const highestGwScore: AwardEntry = {
        ...resolveManager(highestEntry.id, highestEntry.entry_name),
        value: highestRaw.points,
        extra: `GW${highestRaw.event}`,
      }
      const lowestGwScore: AwardEntry = {
        ...resolveManager(lowestEntry.id, lowestEntry.entry_name),
        value: lowestRaw.points,
        extra: `GW${lowestRaw.event}`,
      }

      const elementGwPoints = new Map<number, Map<number, number>>()
      allElementIds.forEach((id, i) => {
        const summary = summaryResults[i]
        if (!summary) return
        const gwMap = new Map<number, number>()
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points))
        elementGwPoints.set(id, gwMap)
      })

      const pickupScored = acceptedPickups.map((pickup) => {
        const ownerEntry = allEntries.find((e) => e.entry_id === pickup.entry)
        if (!ownerEntry) return null

        const startGw = pickup.event
        const endGw = findOwnershipEnd(
          pickup.element_in,
          pickup.entry,
          startGw,
          allTransactions,
          awardsTradeDrops,
          currentEvent,
        )
        const gwPoints = elementGwPoints.get(pickup.element_in)
        let points = 0
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGws.has(gw)) points += gwPoints?.get(gw) ?? 0
        }

        const element = elementMap.get(pickup.element_in)
        return {
          ...resolveManager(ownerEntry.id, ownerEntry.entry_name),
          value: points,
          extra: element?.web_name ?? `#${pickup.element_in}`,
        }
      })

      const bestWaiverRaw = pickupScored
        .filter((w): w is NonNullable<typeof w> => w !== null)
        .sort((a, b) => b.value - a.value)[0]

      const bestWaiver: AwardEntry = bestWaiverRaw ?? {
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      }

      const tradeScored = tradeAcquisitions.map((acq) => {
        const ownerEntry = allEntries.find((e) => e.entry_id === acq.entryId)
        if (!ownerEntry) return null
        const startGw = acq.event
        const endGw = findOwnershipEnd(
          acq.element,
          acq.entryId,
          startGw,
          allTransactions,
          awardsTradeDrops,
          currentEvent,
        )
        const gwPoints = elementGwPoints.get(acq.element)
        let points = 0
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGws.has(gw)) points += gwPoints?.get(gw) ?? 0
        }
        const element = elementMap.get(acq.element)
        return {
          ...resolveManager(ownerEntry.id, ownerEntry.entry_name),
          value: points,
          extra: element?.web_name ?? `#${acq.element}`,
        }
      })

      const bestTradeRaw = tradeScored
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .sort((a, b) => b.value - a.value)[0]

      const bestTrade: AwardEntry = bestTradeRaw ?? {
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      }

      const entryToChoices = new Map<number, DraftChoicesResponse>()
      allDetails.forEach((d, i) => {
        const choices = allChoicesData[i]
        if (!choices) return
        d.league_entries.forEach((e) => entryToChoices.set(e.entry_id, choices))
      })

      const netGains = allEntries.map((entry) => {
        const choices = entryToChoices.get(entry.entry_id)
        if (!choices) return null
        const initialTotal = choices.choices
          .filter((c) => c.entry === entry.entry_id)
          .reduce((sum, c) => sum + (elementMap.get(c.element)?.total_points ?? 0), 0)
        const currentTotal = choices.element_status
          .filter((es) => es.owner === entry.entry_id)
          .reduce((sum, es) => sum + (elementMap.get(es.element)?.total_points ?? 0), 0)
        if (initialTotal === 0) return null
        const pct = ((currentTotal - initialTotal) / initialTotal) * 100
        return {
          ...resolveManager(entry.id, entry.entry_name),
          value: pct,
        }
      })

      const highestNetGainRaw = netGains
        .filter((n): n is NonNullable<typeof n> => n !== null)
        .sort((a, b) => b.value - a.value)[0]

      const highestNetGain: AwardEntry = highestNetGainRaw ?? {
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      }

      const acceptedWaiversOnly = allTransactions.filter((t) => t.kind === "w" && t.result === "a")
      const waiverCounts = new Map<number, number>()
      for (const t of acceptedWaiversOnly) {
        const ownerEntry = allEntries.find((e) => e.entry_id === t.entry)
        if (!ownerEntry) continue
        waiverCounts.set(ownerEntry.id, (waiverCounts.get(ownerEntry.id) ?? 0) + 1)
      }

      const topWaiverApiId = [...waiverCounts.entries()].sort((a, b) => b[1] - a[1])[0]!
      const topWaiverEntry = allEntries.find((e) => e.id === topWaiverApiId[0])!
      const mostWaivers: AwardEntry = {
        ...resolveManager(topWaiverEntry.id, topWaiverEntry.entry_name),
        value: topWaiverApiId[1],
      }

      const tradeCounts = new Map<number, number>()
      for (const trade of allTrades) {
        const offeredEntry = allEntries.find((e) => e.entry_id === trade.offered_entry)
        const receivedEntry = allEntries.find((e) => e.entry_id === trade.received_entry)
        if (offeredEntry)
          tradeCounts.set(offeredEntry.id, (tradeCounts.get(offeredEntry.id) ?? 0) + 1)
        if (receivedEntry)
          tradeCounts.set(receivedEntry.id, (tradeCounts.get(receivedEntry.id) ?? 0) + 1)
      }

      const topTradeApiId = [...tradeCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      const topTradeEntry = topTradeApiId
        ? allEntries.find((e) => e.id === topTradeApiId[0])
        : undefined
      const mostTrades: AwardEntry = topTradeEntry
        ? {
            ...resolveManager(topTradeEntry.id, topTradeEntry.entry_name),
            value: topTradeApiId![1],
          }
        : {
            managerName: "—",
            teamName: "—",
            entryApiId: 0,
            leagueId: input.leagueIds[0] ?? 0,
            value: 0,
          }

      const acceptedFAs = allTransactions.filter((t) => t.kind === "f" && t.result === "a")
      const faCounts = new Map<number, number>()
      for (const t of acceptedFAs) {
        const ownerEntry = allEntries.find((e) => e.entry_id === t.entry)
        if (!ownerEntry) continue
        faCounts.set(ownerEntry.id, (faCounts.get(ownerEntry.id) ?? 0) + 1)
      }

      const topFAApiId = [...faCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      const topFAEntry = topFAApiId ? allEntries.find((e) => e.id === topFAApiId[0]) : undefined
      const mostFreeAgents: AwardEntry = topFAEntry
        ? {
            ...resolveManager(topFAEntry.id, topFAEntry.entry_name),
            value: topFAApiId![1],
          }
        : {
            managerName: "—",
            teamName: "—",
            entryApiId: 0,
            leagueId: input.leagueIds[0] ?? 0,
            value: 0,
          }

      return {
        mostPoints,
        leastPoints,
        mostGwWins,
        mostGwLasts,
        mostRelevant,
        leastRelevant,
        highestGwScore,
        lowestGwScore,
        bestWaiver,
        highestNetGain,
        mostWaivers,
        bestTrade,
        mostTrades,
        mostFreeAgents,
      }
    }),
} satisfies TRPCRouterRecord
