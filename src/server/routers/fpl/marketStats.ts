import { STAT_TABLE_ROW_LIMIT } from "@pbd/lib/constants/Stats"
import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/participants"
import { computeFreeAgentXi } from "@pbd/lib/fpl/freeAgentXi"
import type { XiCandidate } from "@pbd/lib/fpl/freeAgentXi"
import { collectDrops, findReacquisitionEvent, sumPointsSince } from "@pbd/lib/fpl/gotAway"
import {
  countAddedElements,
  countDroppedElements,
  countWantedElements,
} from "@pbd/lib/fpl/marketCounts"
import type { MarketCount } from "@pbd/lib/fpl/marketCounts"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import {
  fetchLeagueDetails,
  fetchLeagueDraftChoices,
  fetchLeagueTransactions,
} from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  BootstrapStaticResponse,
  ElementSummaryResponse,
  FplElement,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"

const MARKET_REPORT_LIMIT = 10
const TREATMENT_FLAG_LIMIT = 3
const AVAILABLE_STATUS = "a"

const fetchBootstrap = (): Promise<BootstrapStaticResponse> =>
  fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP)

const namedCounts = (
  counts: MarketCount[],
  elementMap: Map<number, FplElement>,
  teamMap: Map<number, string>,
): { elementId: number; playerName: string; playerTeam: string; count: number }[] =>
  counts.map((row) => {
    const element = elementMap.get(row.elementId)
    return {
      elementId: row.elementId,
      playerName: element?.web_name ?? `#${row.elementId}`,
      playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
      count: row.count,
    }
  })

export const marketStatsProcedures = {
  gotAway: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allTxData, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueTransactions)),
      fetchBootstrap(),
    ])

    const finishedEvents = bootstrap.events.data
      .filter((event) => event.finished)
      .map((event) => event.id)
      .sort((a, b) => a - b)

    const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))
    const teamMap = new Map(bootstrap.teams.map((team) => [team.id, team.short_name]))

    const dropsByLeague = allTxData.map((txData, index) => ({
      leagueId: input.leagueIds[index] ?? input.leagueIds[0] ?? 0,
      transactions: txData.transactions,
      drops: collectDrops(txData.transactions),
    }))

    const uniqueElementIds = [
      ...new Set(dropsByLeague.flatMap((league) => league.drops.map((drop) => drop.elementId))),
    ]
    const summaryResults = await Promise.all(
      uniqueElementIds.map((id) =>
        fetchFplSafe<ElementSummaryResponse>(
          FPL_ENDPOINTS.elementSummary(id),
          SERVER_TTL.ELEMENT_SUMMARY,
        ),
      ),
    )
    const elementGwPoints = new Map<number, Map<number, number>>()
    uniqueElementIds.forEach((id, index) => {
      const summary = summaryResults[index]
      if (!summary) return
      elementGwPoints.set(id, new Map(summary.history.map((h) => [h.event, h.total_points])))
    })

    const rows = dropsByLeague.flatMap((league) =>
      league.drops.map((drop) => {
        const reacquired = findReacquisitionEvent(drop, league.transactions)
        const { pointsSince, gwsSince } = sumPointsSince(
          drop,
          reacquired,
          elementGwPoints.get(drop.elementId) ?? new Map(),
          finishedEvents,
        )
        const element = elementMap.get(drop.elementId)
        const participant = PARTICIPANT_BY_ENTRY_ID[drop.entryId]
        return {
          elementId: drop.elementId,
          playerName: element?.web_name ?? `#${drop.elementId}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          entryApiId: participant?.apiId ?? 0,
          leagueId: league.leagueId,
          managerName: participant?.nickname ?? participant?.name ?? `Entry ${drop.entryId}`,
          droppedEvent: drop.droppedEvent,
          gwsSince,
          pointsSince,
        }
      }),
    )

    return rows
      .filter((row) => row.gwsSince > 0)
      .sort((a, b) => b.pointsSince - a.pointsSince)
      .slice(0, STAT_TABLE_ROW_LIMIT)
  }),

  marketReport: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allTxData, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueTransactions)),
      fetchBootstrap(),
    ])

    const transactions = allTxData.flatMap((txData) => txData.transactions)
    const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))
    const teamMap = new Map(bootstrap.teams.map((team) => [team.id, team.short_name]))

    return {
      mostAdded: namedCounts(
        countAddedElements(transactions, MARKET_REPORT_LIMIT),
        elementMap,
        teamMap,
      ),
      mostDropped: namedCounts(
        countDroppedElements(transactions, MARKET_REPORT_LIMIT),
        elementMap,
        teamMap,
      ),
      mostWanted: namedCounts(
        countWantedElements(transactions, MARKET_REPORT_LIMIT),
        elementMap,
        teamMap,
      ),
    }
  }),

  freeAgentXi: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allChoices, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueDraftChoices)),
      fetchBootstrap(),
    ])

    const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))
    const teamMap = new Map(bootstrap.teams.map((team) => [team.id, team.short_name]))

    return allChoices.map((choices, index) => {
      const leagueId = input.leagueIds[index] ?? input.leagueIds[0] ?? 0
      const candidates: XiCandidate[] = choices.element_status.flatMap((status) => {
        if (status.owner !== null) return []
        const element = elementMap.get(status.element)
        if (!element || element.removed) return []
        return [
          {
            elementId: element.id,
            webName: element.web_name,
            teamShort: teamMap.get(element.team) ?? "",
            positionType: element.element_type,
            seasonPoints: element.total_points,
          },
        ]
      })
      return { leagueId, xi: computeFreeAgentXi(candidates) }
    })
  }),

  treatmentTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allChoices, allDetails, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueDraftChoices)),
      Promise.all(input.leagueIds.map(fetchLeagueDetails)),
      fetchBootstrap(),
    ])

    const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))
    const entryNameMap = new Map(
      allDetails.flatMap((details) =>
        details.league_entries.map((entry) => [entry.entry_id, entry.entry_name] as const),
      ),
    )

    return allChoices.flatMap((choices, index) => {
      const leagueId = input.leagueIds[index] ?? input.leagueIds[0] ?? 0
      const squads = new Map<number, FplElement[]>()
      for (const status of choices.element_status) {
        if (status.owner === null) continue
        const element = elementMap.get(status.element)
        if (!element) continue
        const squad = squads.get(status.owner) ?? []
        squad.push(element)
        squads.set(status.owner, squad)
      }

      return [...squads.entries()].map(([entryId, squad]) => {
        const flagged = squad
          .filter((element) => element.status !== AVAILABLE_STATUS)
          .sort(
            (a, b) =>
              (a.chance_of_playing_next_round ?? -1) - (b.chance_of_playing_next_round ?? -1),
          )
        const participant = PARTICIPANT_BY_ENTRY_ID[entryId]
        return {
          entryApiId: participant?.apiId ?? 0,
          leagueId,
          managerName: participant?.nickname ?? participant?.name ?? `Entry ${entryId}`,
          teamName: entryNameMap.get(entryId) ?? "",
          flaggedCount: flagged.length,
          worstFlags: flagged.slice(0, TREATMENT_FLAG_LIMIT).map((element) => ({
            webName: element.web_name,
            status: element.status,
            chance: element.chance_of_playing_next_round,
          })),
        }
      })
    })
  }),
} satisfies TRPCRouterRecord
