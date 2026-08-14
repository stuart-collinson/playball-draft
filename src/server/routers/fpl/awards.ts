import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { buildGwScores, tallyGwExtremes } from "@pbd/lib/fpl/gwScores"
import { buildTradeDrops, findOwnershipEnd, sumOwnershipPoints } from "@pbd/lib/fpl/ownership"
import { participantDisplayName } from "@pbd/lib/fpl/participants"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { fetchEntryHistories, fetchLeagueEntries } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  DraftChoicesResponse,
  ElementSummaryResponse,
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

// The entry in a count tally with the highest count, or undefined when the
// tally is empty (e.g. no waivers accepted yet).
const topOfTally = (counts: Map<number, number>): [number, number] | undefined =>
  [...counts.entries()].sort((a, b) => b[1] - a[1])[0]

export const awardsProcedures = {
  // Null until a league has drafted and at least one gameweek has finished.
  awards: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<AwardsData | null> => {
      // Phase 1: parallel top-level fetches
      const [
        { allDetails, bootstrap, entries, finishedGwSet, currentEvent },
        allTxData,
        allTradesData,
        allChoicesData,
      ] = await Promise.all([
        fetchLeagueEntries(input.leagueIds),
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

      // Every award below picks a winner off the top of a sorted list, which
      // has nothing to pick from until a league has drafted and a gameweek has
      // been played. Bail before the per-entry fan-out below rather than
      // fetching a season's worth of history to then read past empty arrays.
      const hasStandings = allDetails.some((details) => details.standings.length > 0)
      if (!hasStandings || finishedGwSet.size === 0) return null

      const allTransactions = allTxData.flatMap((d) => d.transactions)
      const allTrades = allTradesData.flatMap((d) => d.trades)
      const awardsTradeDrops = buildTradeDrops(allTrades)

      const acceptedPickups = allTransactions.filter(
        (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
      )

      type TradeAcquisition = { element: number; entryId: number; event: number }
      const tradeAcquisitions: TradeAcquisition[] = allTrades.flatMap((trade) =>
        trade.tradeitem_set.flatMap((item) => [
          { element: item.element_in, entryId: trade.offered_entry, event: trade.event },
          { element: item.element_out, entryId: trade.received_entry, event: trade.event },
        ]),
      )

      const allElementIds = [
        ...new Set([
          ...acceptedPickups.map((t) => t.element_in),
          ...tradeAcquisitions.map((a) => a.element),
        ]),
      ]

      // Phase 2: entry histories + all element summaries (pickups + trades) in parallel
      const [histories, summaryResults] = await Promise.all([
        fetchEntryHistories(entries),
        Promise.all(
          allElementIds.map((id) =>
            fetchFplSafe<ElementSummaryResponse>(
              FPL_ENDPOINTS.elementSummary(id),
              SERVER_TTL.ELEMENT_SUMMARY,
            ),
          ),
        ),
      ])

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]))
      const entryByApiId = new Map(entries.map((entry) => [entry.id, entry]))
      const entryByEntryId = new Map(entries.map((entry) => [entry.entry_id, entry]))

      const resolveManager = (apiId: number, entryName: string) => ({
        managerName: participantDisplayName(apiId, entryName),
        teamName: entryName,
        entryApiId: apiId,
        leagueId: entryByApiId.get(apiId)?.leagueId ?? input.leagueIds[0] ?? 0,
      })

      const emptyAward = (): AwardEntry => ({
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      })

      const awardForApiId = (apiId: number, value: number, extra?: string): AwardEntry => {
        const entry = entryByApiId.get(apiId)
        return {
          ...resolveManager(apiId, entry?.entry_name ?? "Unknown"),
          value,
          ...(extra !== undefined ? { extra } : {}),
        }
      }

      // ── 1. Most / Least Points ────────────────────────────────────────────
      const standingsFlat = allDetails.flatMap((d) =>
        d.standings.map((s) => ({ apiId: s.league_entry, total: s.total })),
      )
      const byTotal = [...standingsFlat].sort((a, b) => b.total - a.total)
      const topTotal = byTotal[0]
      const bottomTotal = byTotal[byTotal.length - 1]
      const mostPoints = topTotal ? awardForApiId(topTotal.apiId, topTotal.total) : emptyAward()
      const leastPoints = bottomTotal
        ? awardForApiId(bottomTotal.apiId, bottomTotal.total)
        : emptyAward()

      // ── 2. GW wins / GW lasts / relevancy ────────────────────────────────
      const allGwScores = buildGwScores(entries, histories, finishedGwSet)
      // A league that started after the finished gameweeks has standings but
      // no scores yet — the score-based awards have nothing to say.
      if (allGwScores.length === 0) return null

      const { wins: gwWins, lasts: gwLasts } = tallyGwExtremes(allGwScores)

      const topGwWin = topOfTally(gwWins)
      const topGwLast = topOfTally(gwLasts)
      const mostGwWins = topGwWin ? awardForApiId(topGwWin[0], topGwWin[1]) : emptyAward()
      const mostGwLasts = topGwLast ? awardForApiId(topGwLast[0], topGwLast[1]) : emptyAward()

      const relevancyByApiId = new Map(
        entries.map((entry) => [
          entry.id,
          (gwWins.get(entry.id) ?? 0) + (gwLasts.get(entry.id) ?? 0),
        ]),
      )
      const sortedByRelevancy = [...relevancyByApiId.entries()].sort((a, b) => b[1] - a[1])
      const topRelevant = sortedByRelevancy[0]
      const bottomRelevant = sortedByRelevancy[sortedByRelevancy.length - 1]
      const mostRelevant = topRelevant
        ? awardForApiId(topRelevant[0], topRelevant[1])
        : emptyAward()
      const leastRelevant = bottomRelevant
        ? awardForApiId(bottomRelevant[0], bottomRelevant[1])
        : emptyAward()

      // ── 3. Highest / Lowest single GW score ──────────────────────────────
      const sortedScores = [...allGwScores].sort((a, b) => b.points - a.points)
      const highestRaw = sortedScores[0]
      const lowestRaw = sortedScores[sortedScores.length - 1]
      const highestGwScore = highestRaw
        ? awardForApiId(highestRaw.apiId, highestRaw.points, `GW${highestRaw.event}`)
        : emptyAward()
      const lowestGwScore = lowestRaw
        ? awardForApiId(lowestRaw.apiId, lowestRaw.points, `GW${lowestRaw.event}`)
        : emptyAward()

      // ── 4. Best Pickup / Best Trade (total pts during ownership) ─────────
      const elementGwPoints = new Map<number, Map<number, number>>()
      allElementIds.forEach((id, i) => {
        const summary = summaryResults[i]
        if (!summary) return
        elementGwPoints.set(id, new Map(summary.history.map((h) => [h.event, h.total_points])))
      })

      const scoreAcquisition = (
        element: number,
        ownerEntryId: number,
        startGw: number,
      ): AwardEntry | null => {
        const ownerEntry = entryByEntryId.get(ownerEntryId)
        if (!ownerEntry) return null

        const endGw = findOwnershipEnd(
          element,
          ownerEntryId,
          startGw,
          allTransactions,
          awardsTradeDrops,
          currentEvent,
        )
        const { points } = sumOwnershipPoints(
          elementGwPoints.get(element),
          startGw,
          endGw,
          finishedGwSet,
        )

        return awardForApiId(
          ownerEntry.id,
          points,
          elementMap.get(element)?.web_name ?? `#${element}`,
        )
      }

      const bestWaiver =
        acceptedPickups
          .map((pickup) => scoreAcquisition(pickup.element_in, pickup.entry, pickup.event))
          .filter((award): award is AwardEntry => award !== null)
          .sort((a, b) => b.value - a.value)[0] ?? emptyAward()

      const bestTrade =
        tradeAcquisitions
          .map((acq) => scoreAcquisition(acq.element, acq.entryId, acq.event))
          .filter((award): award is AwardEntry => award !== null)
          .sort((a, b) => b.value - a.value)[0] ?? emptyAward()

      // ── 5. Highest Net Gain % ─────────────────────────────────────────────
      const choicesByLeagueId = new Map(
        input.leagueIds.map((id, index) => [id, allChoicesData[index]]),
      )

      const netGains = entries.map((entry) => {
        const choices = choicesByLeagueId.get(entry.leagueId)
        if (!choices) return null
        const initialTotal = choices.choices
          .filter((c) => c.entry === entry.entry_id)
          .reduce((sum, c) => sum + (elementMap.get(c.element)?.total_points ?? 0), 0)
        const currentTotal = choices.element_status
          .filter((es) => es.owner === entry.entry_id)
          .reduce((sum, es) => sum + (elementMap.get(es.element)?.total_points ?? 0), 0)
        if (initialTotal === 0) return null
        const pct = ((currentTotal - initialTotal) / initialTotal) * 100
        return awardForApiId(entry.id, pct)
      })

      const highestNetGain =
        netGains
          .filter((award): award is AwardEntry => award !== null)
          .sort((a, b) => b.value - a.value)[0] ?? emptyAward()

      // ── 6. Most Waivers / Most Trades / Most Free Agents ─────────────────
      const countByOwner = (ownerEntryIds: number[]): Map<number, number> => {
        const counts = new Map<number, number>()
        for (const entryId of ownerEntryIds) {
          const owner = entryByEntryId.get(entryId)
          if (!owner) continue
          counts.set(owner.id, (counts.get(owner.id) ?? 0) + 1)
        }
        return counts
      }

      const waiverCounts = countByOwner(
        allTransactions.filter((t) => t.kind === "w" && t.result === "a").map((t) => t.entry),
      )
      const tradeCounts = countByOwner(
        allTrades.flatMap((trade) => [trade.offered_entry, trade.received_entry]),
      )
      const faCounts = countByOwner(
        allTransactions.filter((t) => t.kind === "f" && t.result === "a").map((t) => t.entry),
      )

      const topWaiver = topOfTally(waiverCounts)
      const topTrade = topOfTally(tradeCounts)
      const topFA = topOfTally(faCounts)
      const mostWaivers = topWaiver ? awardForApiId(topWaiver[0], topWaiver[1]) : emptyAward()
      const mostTrades = topTrade ? awardForApiId(topTrade[0], topTrade[1]) : emptyAward()
      const mostFreeAgents = topFA ? awardForApiId(topFA[0], topFA[1]) : emptyAward()

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
