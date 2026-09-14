import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import { sumSquadLivePoints } from "@pbd/lib/fpl/livePoints"
import type { LivePointsLookups } from "@pbd/lib/fpl/livePoints"
import { sumSquadLiveReturns } from "@pbd/lib/fpl/liveReturns"
import type { LiveReturnsLookups } from "@pbd/lib/fpl/liveReturns"
import { buildFixtureProgress, countSquadToPlay } from "@pbd/lib/fpl/toPlay"
import type { FixtureProgress } from "@pbd/lib/fpl/toPlay"
import { fetchBootstrapStatic } from "@pbd/server/fpl/bootstrap"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  ElementSummaryResponse,
  EntryEventPick,
  EntryEventPicksResponse,
  EventLiveResponse,
  FplGame,
  GoalsAndAssists,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

type LiveSquad = {
  entryApiId: number
  picks: EntryEventPick[]
}

type LiveSquads = {
  lookups: LivePointsLookups & LiveReturnsLookups
  progress: FixtureProgress
  squads: LiveSquad[]
}

const MAX_ELEMENT_SUMMARY_BATCH = 200

const fetchLiveSquads = async (leagueIds: number[]): Promise<LiveSquads | null> => {
  const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
  const currentEvent = game.current_event
  if (!currentEvent) return null

  const [allDetails, bootstrap, liveData] = await Promise.all([
    Promise.all(leagueIds.map(fetchLeagueDetails)),
    fetchBootstrapStatic(),
    fetchFplSafe<EventLiveResponse>(FPL_ENDPOINTS.eventLive(currentEvent), SERVER_TTL.EVENT_LIVE),
  ])

  const liveElements = Object.entries(liveData?.elements ?? {}).map(
    ([id, element]) => [Number.parseInt(id, 10), element] as const,
  )
  const lookups: LiveSquads["lookups"] = {
    teamByElement: new Map(bootstrap.elements.map((element) => [element.id, element.team])),
    typeByElement: new Map(bootstrap.elements.map((element) => [element.id, element.element_type])),
    minutesByElement: new Map(liveElements.map(([id, element]) => [id, element.stats.minutes])),
    pointsByElement: new Map(liveElements.map(([id, element]) => [id, element.stats.total_points])),
    returnsByElement: new Map(
      liveElements.map(([id, element]) => [
        id,
        { goals: element.stats.goals_scored, assists: element.stats.assists },
      ]),
    ),
  }
  const progress = buildFixtureProgress(Array.isArray(liveData?.fixtures) ? liveData.fixtures : [])

  const entries = allDetails.flatMap((details) => details.league_entries)
  const picksResults = await Promise.all(
    entries.map((entry) =>
      fetchFplSafe<EntryEventPicksResponse>(
        FPL_ENDPOINTS.entryEventPicks(entry.entry_id, currentEvent),
        SERVER_TTL.PICKS_LIVE,
      ),
    ),
  )

  return {
    lookups,
    progress,
    squads: entries.map((entry, index) => ({
      entryApiId: entry.id,
      picks: picksResults[index]?.picks ?? [],
    })),
  }
}

const scoreSquads = async <T>(
  leagueIds: number[],
  score: (squad: LiveSquad, live: LiveSquads) => T,
): Promise<Record<number, T>> => {
  const live = await fetchLiveSquads(leagueIds)
  const result: Record<number, T> = {}
  if (!live) return result

  for (const squad of live.squads) result[squad.entryApiId] = score(squad, live)

  return result
}

export const liveProcedures = {
  eventLive: publicProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(
      ({ input }): Promise<EventLiveResponse> =>
        fetchFpl(FPL_ENDPOINTS.eventLive(input.eventId), SERVER_TTL.EVENT_LIVE),
    ),

  currentGwToPlay: publicProcedure
    .input(leagueIdsInput)
    .query(
      ({ input }): Promise<Record<number, number>> =>
        scoreSquads(input.leagueIds, (squad, live) =>
          countSquadToPlay(squad.picks, live.progress, live.lookups),
        ),
    ),

  currentGwPoints: publicProcedure
    .input(leagueIdsInput)
    .query(
      ({ input }): Promise<Record<number, number>> =>
        scoreSquads(input.leagueIds, (squad, live) =>
          sumSquadLivePoints(squad.picks, live.progress, live.lookups),
        ),
    ),

  currentGwGoalsAndAssists: publicProcedure
    .input(leagueIdsInput)
    .query(
      ({ input }): Promise<Record<number, GoalsAndAssists>> =>
        scoreSquads(input.leagueIds, (squad, live) =>
          sumSquadLiveReturns(squad.picks, live.progress, live.lookups),
        ),
    ),

  elementSummaries: publicProcedure
    .input(
      z.object({
        elementIds: z.array(z.number().int().positive()).min(1).max(MAX_ELEMENT_SUMMARY_BATCH),
      }),
    )
    .query(async ({ input }): Promise<Record<number, ElementSummaryResponse | null>> => {
      const results = await Promise.all(
        input.elementIds.map((elementId) =>
          fetchFplSafe<ElementSummaryResponse>(
            FPL_ENDPOINTS.elementSummary(elementId),
            SERVER_TTL.ELEMENT_SUMMARY,
          ),
        ),
      )

      return Object.fromEntries(
        input.elementIds.map((elementId, index) => [elementId, results[index] ?? null]),
      )
    }),
} satisfies TRPCRouterRecord
