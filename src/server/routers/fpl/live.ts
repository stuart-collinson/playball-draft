import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { type LivePointsLookups, sumSquadLivePoints } from "@pbd/lib/fpl/livePoints"
import { type SquadLookups, buildFixtureProgress, countSquadToPlay } from "@pbd/lib/fpl/toPlay"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  BootstrapStaticResponse,
  ElementSummaryResponse,
  EntryEventPicksResponse,
  EventLiveResponse,
  FplGame,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

const MAX_ELEMENT_SUMMARY_BATCH = 200

export const liveProcedures = {
  eventLive: publicProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(
      ({ input }): Promise<EventLiveResponse> =>
        fetchFpl(FPL_ENDPOINTS.eventLive(input.eventId), SERVER_TTL.EVENT_LIVE),
    ),

  currentGwToPlay: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<Record<number, number>> => {
      const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
      const currentEvent = game.current_event
      if (!currentEvent) return {}

      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(input.leagueIds.map(fetchLeagueDetails)),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const liveData = await fetchFplSafe<EventLiveResponse>(
        FPL_ENDPOINTS.eventLive(currentEvent),
        SERVER_TTL.EVENT_LIVE,
      )

      const lookups: SquadLookups = {
        teamByElement: new Map(bootstrap.elements.map((e) => [e.id, e.team])),
        typeByElement: new Map(bootstrap.elements.map((e) => [e.id, e.element_type])),
        minutesByElement: new Map(
          Object.entries(liveData?.elements ?? {}).map(([id, el]) => [
            Number.parseInt(id, 10),
            el.stats.minutes,
          ]),
        ),
      }

      const progress = buildFixtureProgress(
        Array.isArray(liveData?.fixtures) ? liveData.fixtures : [],
      )

      const allEntries = allDetails.flatMap((d) => d.league_entries)
      const allStandings = allDetails.flatMap((d) =>
        d.standings.map((s) => ({ leagueEntryId: s.league_entry, ...s })),
      )

      const picksResults = await Promise.all(
        allEntries.map((e) =>
          fetchFplSafe<EntryEventPicksResponse>(
            FPL_ENDPOINTS.entryEventPicks(e.entry_id, currentEvent),
            SERVER_TTL.PICKS_LIVE,
          ),
        ),
      )

      const result: Record<number, number> = {}

      for (const standing of allStandings) {
        const leagueEntryId = standing.leagueEntryId
        const entryIndex = allEntries.findIndex((e) => e.id === leagueEntryId)
        if (entryIndex === -1) continue

        const picks = picksResults[entryIndex]?.picks ?? []

        result[leagueEntryId] = countSquadToPlay(picks, progress, lookups)
      }

      return result
    }),

  currentGwPoints: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<Record<number, number>> => {
      const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
      const currentEvent = game.current_event
      if (!currentEvent) return {}

      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(input.leagueIds.map(fetchLeagueDetails)),
        fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
      ])

      const liveData = await fetchFplSafe<EventLiveResponse>(
        FPL_ENDPOINTS.eventLive(currentEvent),
        SERVER_TTL.EVENT_LIVE,
      )

      const liveElements = Object.entries(liveData?.elements ?? {})

      const lookups: LivePointsLookups = {
        teamByElement: new Map(bootstrap.elements.map((e) => [e.id, e.team])),
        typeByElement: new Map(bootstrap.elements.map((e) => [e.id, e.element_type])),
        minutesByElement: new Map(
          liveElements.map(([id, el]) => [Number.parseInt(id, 10), el.stats.minutes]),
        ),
        pointsByElement: new Map(
          liveElements.map(([id, el]) => [Number.parseInt(id, 10), el.stats.total_points]),
        ),
      }

      const progress = buildFixtureProgress(
        Array.isArray(liveData?.fixtures) ? liveData.fixtures : [],
      )

      const allEntries = allDetails.flatMap((d) => d.league_entries)

      const picksResults = await Promise.all(
        allEntries.map((e) =>
          fetchFplSafe<EntryEventPicksResponse>(
            FPL_ENDPOINTS.entryEventPicks(e.entry_id, currentEvent),
            SERVER_TTL.PICKS_LIVE,
          ),
        ),
      )

      const result: Record<number, number> = {}

      for (const [index, entry] of allEntries.entries()) {
        const picks = picksResults[index]?.picks ?? []
        result[entry.id] = sumSquadLivePoints(picks, progress, lookups)
      }

      return result
    }),

  currentGwGoalsScored: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<Record<number, number>> => {
      const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
      const currentEvent = game.current_event
      if (!currentEvent) return {}

      const allDetails = await Promise.all(input.leagueIds.map(fetchLeagueDetails))

      const liveData = await fetchFplSafe<EventLiveResponse>(
        FPL_ENDPOINTS.eventLive(currentEvent),
        SERVER_TTL.EVENT_LIVE,
      )

      const elementGoals = new Map<number, number>(
        Object.entries(liveData?.elements ?? {}).map(([id, el]) => [
          Number.parseInt(id, 10),
          el.stats.goals_scored,
        ]),
      )

      const allEntries = allDetails.flatMap((d) => d.league_entries)

      const picksResults = await Promise.all(
        allEntries.map((e) =>
          fetchFplSafe<EntryEventPicksResponse>(
            FPL_ENDPOINTS.entryEventPicks(e.entry_id, currentEvent),
            SERVER_TTL.PICKS_LIVE,
          ),
        ),
      )

      const result: Record<number, number> = {}

      for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i]!
        const picks = picksResults[i]?.picks ?? []
        result[entry.id] = picks
          .filter((p) => p.multiplier > 0)
          .reduce((sum, p) => sum + (elementGoals.get(p.element) ?? 0), 0)
      }

      return result
    }),

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
