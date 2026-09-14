import type { AwardKey } from "@pbd/lib/constants/Awards"
import { computeGameweekCounts } from "@pbd/lib/fpl/gameweekCounts"
import { resolveGameweekVerdicts } from "@pbd/lib/fpl/gameweekVerdicts"
import {
  buildTradeAcquisitions,
  buildTradeDrops,
  findOwnershipEnd,
  isAcceptedPickup,
  sumPointsWhileOwned,
} from "@pbd/lib/fpl/ownership"
import type { OwnershipRecord } from "@pbd/lib/fpl/ownership"
import { computeLeagueRecords, pickRecordExtreme } from "@pbd/lib/fpl/records"
import type { RecordKey } from "@pbd/lib/fpl/records"
import { fetchBootstrapStatic } from "@pbd/server/fpl/bootstrap"
import { fetchElementGameweekPoints } from "@pbd/server/fpl/elementPoints"
import {
  fetchLeagueDetails,
  fetchLeagueDraftChoices,
  fetchLeagueTrades,
  fetchLeagueTransactions,
} from "@pbd/server/fpl/leagueData"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { TRPCRouterRecord } from "@trpc/server"

type AwardEntry = {
  managerName: string
  teamName: string
  entryApiId: number
  leagueId: number
  value: number
  extra?: string
}

type Manager = Omit<AwardEntry, "value" | "extra">

type AwardsData = Record<AwardKey, AwardEntry>

const UNKNOWN_MANAGER = "Unknown"

const PERCENT = 100

const emptyAward = (leagueId: number): AwardEntry => ({
  managerName: "—",
  teamName: "—",
  entryApiId: 0,
  leagueId,
  value: 0,
})

const toManager = (entry: SeasonEntry): Manager => ({
  managerName: entry.managerName,
  teamName: entry.teamName,
  entryApiId: entry.entryApiId,
  leagueId: entry.leagueId,
})

const highestFirst = <T extends { value: number }>(entries: T[]): T[] =>
  [...entries].sort((a, b) => b.value - a.value)

const gameweekLabel = (event: number): string => `GW${event}`

export const awardsProcedures = {
  awards: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<AwardsData | null> => {
      const fallbackLeagueId = input.leagueIds[0] ?? 0

      const [season, allDetails, bootstrap, allTxData, allTradesData, allChoicesData] =
        await Promise.all([
          fetchSeasonScores(input.leagueIds),
          Promise.all(input.leagueIds.map(fetchLeagueDetails)),
          fetchBootstrapStatic(),
          Promise.all(input.leagueIds.map(fetchLeagueTransactions)),
          Promise.all(input.leagueIds.map(fetchLeagueTrades)),
          Promise.all(input.leagueIds.map(fetchLeagueDraftChoices)),
        ])

      const finishedGws = new Set(season.finishedEvents)
      const hasStandings = allDetails.some((details) => details.standings.length > 0)
      if (!hasStandings || finishedGws.size === 0) return null

      const scores = season.entries.flatMap((entry) =>
        entry.rows.map((row) => ({
          entryApiId: entry.entryApiId,
          leagueId: entry.leagueId,
          event: row.event,
          points: row.points,
        })),
      )
      if (scores.length === 0) return null

      const entriesByApiId = new Map(season.entries.map((entry) => [entry.entryApiId, entry]))
      const entriesByEntryId = new Map(season.entries.map((entry) => [entry.entryId, entry]))

      const managerFor = (apiId: number): Manager => {
        const entry = entriesByApiId.get(apiId)
        if (entry) return toManager(entry)

        return {
          managerName: UNKNOWN_MANAGER,
          teamName: UNKNOWN_MANAGER,
          entryApiId: apiId,
          leagueId: fallbackLeagueId,
        }
      }

      const topCountAward = (counts: Map<number, number>): AwardEntry => {
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
        if (!top || !entriesByApiId.has(top[0])) return emptyAward(fallbackLeagueId)

        return { ...managerFor(top[0]), value: top[1] }
      }

      const tally = (entryIds: number[]): Map<number, number> => {
        const counts = new Map<number, number>()
        for (const entryId of entryIds) {
          const owner = entriesByEntryId.get(entryId)
          if (owner) counts.set(owner.entryApiId, (counts.get(owner.entryApiId) ?? 0) + 1)
        }
        return counts
      }

      const byTotal = highestFirst(
        allDetails.flatMap((details) =>
          details.standings.map((standing) => ({
            ...managerFor(standing.league_entry),
            value: standing.total,
          })),
        ),
      )
      const mostPoints = byTotal[0] ?? emptyAward(fallbackLeagueId)
      const leastPoints = byTotal[byTotal.length - 1] ?? emptyAward(fallbackLeagueId)

      const benchByEntry = await fetchSquadWeekStats(
        season.entries.map(({ entryApiId, entryId }) => ({ entryApiId, entryId })),
        season.finishedEvents,
      )
      const tableRanks = new Map(
        allDetails.flatMap((details) =>
          details.standings.map((standing) => [standing.league_entry, standing.rank] as const),
        ),
      )
      const verdicts = resolveGameweekVerdicts(scores, {
        goalsFor: (apiId, event) =>
          benchByEntry.get(apiId)?.find((week) => week.event === event)?.starterGoals ?? 0,
        tableRankFor: (apiId) => tableRanks.get(apiId) ?? null,
      })
      const counts = computeGameweekCounts(verdicts)
      const gwWins = new Map(counts.map((count) => [count.entryApiId, count.gwWins]))
      const gwLasts = new Map(counts.map((count) => [count.entryApiId, count.gwLosses]))

      const mostGwWins = topCountAward(gwWins)
      const mostGwLasts = topCountAward(gwLasts)

      const byRelevancy = highestFirst(
        season.entries.map((entry) => ({
          ...toManager(entry),
          value: (gwWins.get(entry.entryApiId) ?? 0) + (gwLasts.get(entry.entryApiId) ?? 0),
        })),
      )
      const mostRelevant = byRelevancy[0] ?? emptyAward(fallbackLeagueId)
      const leastRelevant = byRelevancy[byRelevancy.length - 1] ?? emptyAward(fallbackLeagueId)

      const byPoints = highestFirst(
        scores.map((score) => ({
          ...managerFor(score.entryApiId),
          value: score.points,
          extra: gameweekLabel(score.event),
        })),
      )
      const highestGwScore = byPoints[0] ?? emptyAward(fallbackLeagueId)
      const lowestGwScore = byPoints[byPoints.length - 1] ?? emptyAward(fallbackLeagueId)

      const recordsInput = season.entries.map((entry) => {
        const benchRows = new Map(
          (benchByEntry.get(entry.entryApiId) ?? []).map((row) => [row.event, row.benchPoints]),
        )
        return {
          entryApiId: entry.entryApiId,
          leagueId: entry.leagueId,
          rows: entry.rows.map((row) => ({
            event: row.event,
            points: row.points,
            pointsOnBench: benchRows.get(row.event) ?? 0,
          })),
        }
      })
      const leagueRecords = computeLeagueRecords(recordsInput, verdicts)

      const recordAward = (key: RecordKey, direction: "max" | "min"): AwardEntry => {
        const best = pickRecordExtreme(leagueRecords, key, direction)
        const holder = best?.holders[0]
        if (!best || !holder) return emptyAward(fallbackLeagueId)

        return {
          ...managerFor(holder.entryApiId),
          value: best.value,
          extra: gameweekLabel(holder.event),
        }
      }

      const biggestMargin = recordAward("biggest-margin", "max")
      const closestCall = recordAward("closest-call", "min")
      const bestLosingScore = recordAward("best-non-winner", "max")
      const cheapestWin = recordAward("lowest-winner", "min")
      const biggestBenchWaste = recordAward("biggest-bench-waste", "max")

      const allTransactions = allTxData.flatMap((data) => data.transactions)
      const allTrades = allTradesData.flatMap((data) => data.trades)
      const tradeDrops = buildTradeDrops(allTrades)
      const pickups = allTransactions.filter(isAcceptedPickup)
      const tradeAcquisitions = buildTradeAcquisitions(allTrades)
      const currentEvent = bootstrap.events.current ?? 0
      const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))

      const elementGwPoints = await fetchElementGameweekPoints([
        ...new Set([
          ...pickups.map((pickup) => pickup.element_in),
          ...tradeAcquisitions.map((acquisition) => acquisition.element),
        ]),
      ])

      const acquisitionAward = (acquisition: OwnershipRecord): AwardEntry | null => {
        const owner = entriesByEntryId.get(acquisition.entryId)
        if (!owner) return null

        const endGw = findOwnershipEnd(
          acquisition.element,
          acquisition.entryId,
          acquisition.event,
          allTransactions,
          tradeDrops,
          currentEvent,
        )
        const { points } = sumPointsWhileOwned(
          acquisition.event,
          endGw,
          elementGwPoints.get(acquisition.element),
          finishedGws,
        )

        return {
          ...toManager(owner),
          value: points,
          extra: elementMap.get(acquisition.element)?.web_name ?? `#${acquisition.element}`,
        }
      }

      const bestAcquisition = (acquisitions: OwnershipRecord[]): AwardEntry =>
        highestFirst(
          acquisitions.map(acquisitionAward).filter((award): award is AwardEntry => award !== null),
        )[0] ?? emptyAward(fallbackLeagueId)

      const bestWaiver = bestAcquisition(
        pickups.map((pickup) => ({
          element: pickup.element_in,
          entryId: pickup.entry,
          event: pickup.event,
        })),
      )
      const bestTrade = bestAcquisition(tradeAcquisitions)

      const choicesByLeague = new Map(
        input.leagueIds.map((leagueId, index) => [leagueId, allChoicesData[index]]),
      )
      const netGains = highestFirst(
        season.entries.flatMap((entry) => {
          const choices = choicesByLeague.get(entry.leagueId)
          if (!choices) return []

          const initialTotal = choices.choices
            .filter((choice) => choice.entry === entry.entryId)
            .reduce((sum, choice) => sum + (elementMap.get(choice.element)?.total_points ?? 0), 0)
          const currentTotal = choices.element_status
            .filter((status) => status.owner === entry.entryId)
            .reduce((sum, status) => sum + (elementMap.get(status.element)?.total_points ?? 0), 0)
          if (initialTotal === 0) return []

          return [
            {
              ...toManager(entry),
              value: ((currentTotal - initialTotal) / initialTotal) * PERCENT,
            },
          ]
        }),
      )
      const highestNetGain = netGains[0] ?? emptyAward(fallbackLeagueId)

      const mostWaivers = topCountAward(
        tally(pickups.filter((pickup) => pickup.kind === "w").map((pickup) => pickup.entry)),
      )
      const mostTrades = topCountAward(
        tally(allTrades.flatMap((trade) => [trade.offered_entry, trade.received_entry])),
      )
      const mostFreeAgents = topCountAward(
        tally(pickups.filter((pickup) => pickup.kind === "f").map((pickup) => pickup.entry)),
      )

      return {
        mostPoints,
        leastPoints,
        mostGwWins,
        mostGwLasts,
        mostRelevant,
        leastRelevant,
        highestGwScore,
        lowestGwScore,
        biggestMargin,
        closestCall,
        bestLosingScore,
        cheapestWin,
        biggestBenchWaste,
        bestWaiver,
        highestNetGain,
        mostWaivers,
        bestTrade,
        mostTrades,
        mostFreeAgents,
      }
    }),
} satisfies TRPCRouterRecord
