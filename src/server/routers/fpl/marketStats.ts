import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/Participants"
import { STAT_TABLE_ROW_LIMIT } from "@pbd/lib/constants/Stats"
import { computeFreeAgentXi } from "@pbd/lib/fpl/freeAgentXi"
import type { XiCandidate } from "@pbd/lib/fpl/freeAgentXi"
import { collectDrops, findReacquisitionEvent, sumPointsSince } from "@pbd/lib/fpl/gotAway"
import { managerNameForEntryId } from "@pbd/lib/people"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
import { fetchElementGameweekPoints } from "@pbd/server/fpl/elementPoints"
import { fetchLeagueDraftChoices, fetchLeagueTransactions } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { TRPCRouterRecord } from "@trpc/server"

export const marketStatsProcedures = {
  gotAway: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allTxData, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueTransactions)),
      fetchBootstrapStatic(),
    ])

    const finishedEvents = finishedEventIds(bootstrap)

    const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))
    const teamMap = new Map(bootstrap.teams.map((team) => [team.id, team.short_name]))

    const dropsByLeague = allTxData.map((txData, index) => ({
      leagueId: input.leagueIds[index] ?? input.leagueIds[0] ?? 0,
      transactions: txData.transactions,
      drops: collectDrops(txData.transactions),
    }))

    const elementGwPoints = await fetchElementGameweekPoints([
      ...new Set(dropsByLeague.flatMap((league) => league.drops.map((drop) => drop.elementId))),
    ])

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
          managerName: managerNameForEntryId(drop.entryId, `Entry ${drop.entryId}`),
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
      .map(({ gwsSince, ...row }) => row)
  }),

  freeAgentXi: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allChoices, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueDraftChoices)),
      fetchBootstrapStatic(),
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
} satisfies TRPCRouterRecord
