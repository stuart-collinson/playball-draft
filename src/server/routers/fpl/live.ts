import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { STARTING_XI_MAX_POSITION } from "@pbd/lib/fpl/scoring"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  BootstrapStaticResponse,
  ElementSummaryResponse,
  EntryEventPicksResponse,
  EventLiveResponse,
  FplGame,
  LeagueDetailsResponse,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

// Bounds the upstream fan-out. Set well above a realistic season's pickups
// (roughly three moves a gameweek over 38 gameweeks) so an active manager
// never trips it and loses their Best Pickup stat entirely.
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
      // /game is the current-event source of truth — a tiny payload on a short
      // TTL, so the bootstrap no longer has to bypass the cache to stay correct.
      const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
      const currentEvent = game.current_event
      if (!currentEvent) return {}

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

      const liveData = await fetchFplSafe<EventLiveResponse>(
        FPL_ENDPOINTS.eventLive(currentEvent),
        SERVER_TTL.EVENT_LIVE,
      )

      const liveMinutes = new Map<number, number>(
        Object.entries(liveData?.elements ?? {}).map(([id, el]) => [
          Number.parseInt(id, 10),
          el.stats.minutes,
        ]),
      )

      const fixturesList = Array.isArray(liveData?.fixtures) ? liveData.fixtures : []

      const elementTeam = new Map<number, number>(bootstrap.elements.map((e) => [e.id, e.team]))
      const elementType = new Map<number, number>(
        bootstrap.elements.map((e) => [e.id, e.element_type]),
      )

      // Count unfinished fixtures per team (handles DGW where a team plays twice)
      const teamUnfinishedCount = new Map<number, number>()
      const teamHasAnyFixture = new Set<number>()
      for (const f of fixturesList) {
        const teams = [f.team_h, f.team_a]
        for (const teamId of teams) {
          teamHasAnyFixture.add(teamId)
          if (!f.finished) {
            teamUnfinishedCount.set(teamId, (teamUnfinishedCount.get(teamId) ?? 0) + 1)
          }
        }
      }

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

        const starters = picks
          .filter((p) => p.position <= STARTING_XI_MAX_POSITION)
          .sort((a, b) => a.position - b.position)
        const bench = picks
          .filter((p) => p.position > STARTING_XI_MAX_POSITION)
          .sort((a, b) => a.position - b.position)
        const benchOutfield = bench.filter((p) => elementType.get(p.element) !== 1)
        const benchGk = bench.find((p) => elementType.get(p.element) === 1)

        let toPlay = 0
        let outfieldBenchIdx = 0
        let gkBenchUsed = false

        for (const starter of starters) {
          const teamId = elementTeam.get(starter.element)
          if (!teamId || !teamHasAnyFixture.has(teamId)) continue

          const unfinished = teamUnfinishedCount.get(teamId) ?? 0
          const minutes = liveMinutes.get(starter.element) ?? 0

          if (unfinished > 0) {
            // Team has fixtures still to play — count each one (handles DGW correctly)
            toPlay += unfinished
          } else if (minutes === 0) {
            // All fixtures done, player got 0 mins — try bench substitution
            const isGk = elementType.get(starter.element) === 1
            if (isGk) {
              if (!gkBenchUsed && benchGk) {
                gkBenchUsed = true
                const subTeamId = elementTeam.get(benchGk.element)
                if (subTeamId) toPlay += teamUnfinishedCount.get(subTeamId) ?? 0
              }
            } else {
              const sub = benchOutfield[outfieldBenchIdx]
              outfieldBenchIdx++
              if (sub) {
                const subTeamId = elementTeam.get(sub.element)
                if (subTeamId) toPlay += teamUnfinishedCount.get(subTeamId) ?? 0
              }
            }
          }
        }

        result[leagueEntryId] = toPlay
      }

      return result
    }),

  currentGwGoalsScored: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<Record<number, number>> => {
      const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
      const currentEvent = game.current_event
      if (!currentEvent) return {}

      const allDetails = await Promise.all(
        input.leagueIds.map((id) =>
          fetchFpl<LeagueDetailsResponse>(
            FPL_ENDPOINTS.leagueDetails(id),
            SERVER_TTL.LEAGUE_DETAILS,
          ),
        ),
      )

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
        // Draft sets multiplier: 1 on ALL 15 picks (no captains), so filtering
        // on it counted bench goals. The counted XI is positions 1-11 — FPL's
        // own frontend splits XI/bench the same way, and picks come back
        // re-ordered post-autosub once a gameweek finishes.
        result[entry.id] = picks
          .filter((p) => p.position <= STARTING_XI_MAX_POSITION)
          .reduce((sum, p) => sum + (elementGoals.get(p.element) ?? 0), 0)
      }

      return result
    }),

  // The player modal needs one summary per pickup, which as individual
  // queries meant N browser round trips. The server-side fan-out stays, but
  // each element is deduped by the data cache across every caller.
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
