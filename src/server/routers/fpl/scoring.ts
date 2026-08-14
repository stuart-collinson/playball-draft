import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { participantDisplayName } from "@pbd/lib/fpl/participants"
import {
  STARTING_XI_MAX_POSITION,
  addCategoryTotals,
  buildElementCategoryTotals,
  emptyCategoryTotals,
  sumPickCategories,
} from "@pbd/lib/fpl/scoring"
import type { CategoryTotals } from "@pbd/lib/fpl/scoring"
import { SERVER_TTL, fetchFpl, fetchFplOrNotFound } from "@pbd/server/fpl/client"
import { fetchLeagueEntries } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { EntryEventPicksResponse, EventLiveResponse } from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"

// A cache-cold full season is ~38 eventLive fetches plus one picks fetch per
// entry per gameweek. Chunking bounds how many hit FPL at once — its WAF is
// already known to be hostile — at negligible cost once the data cache is warm.
const GAMEWEEK_FETCH_CHUNK = 6

type ScoringBreakdownRow = {
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  categories: CategoryTotals
}

export const scoringProcedures = {
  // Season totals per participant, split by how the points were scored: the
  // sum over every gameweek of their counted XI's explain entries. Includes
  // the in-progress gameweek so totals move live during matches.
  scoringBreakdown: publicProcedure
    .input(leagueIdsInput)
    .query(async ({ input }): Promise<ScoringBreakdownRow[]> => {
      const { entries, finishedGwSet, currentEvent } = await fetchLeagueEntries(input.leagueIds)

      const gameweeks = [...finishedGwSet]
      if (currentEvent && !finishedGwSet.has(currentEvent)) gameweeks.push(currentEvent)

      // Nothing has been played: no rows rather than a ranked list of zeros.
      if (gameweeks.length === 0) return []

      const totalsByEntryId = new Map(
        entries.map((entry) => [entry.entry_id, emptyCategoryTotals()]),
      )

      for (let start = 0; start < gameweeks.length; start += GAMEWEEK_FETCH_CHUNK) {
        const chunk = gameweeks.slice(start, start + GAMEWEEK_FETCH_CHUNK)

        await Promise.all(
          chunk.map(async (gameweek) => {
            const isFinal = finishedGwSet.has(gameweek)

            const [live, picksResults] = await Promise.all([
              fetchFpl<EventLiveResponse>(
                FPL_ENDPOINTS.eventLive(gameweek),
                isFinal ? SERVER_TTL.EVENT_LIVE_FINAL : SERVER_TTL.EVENT_LIVE,
              ),
              Promise.all(
                entries.map((entry) =>
                  // Null only for a genuine 404 — an entry has no picks for
                  // gameweeks before its league started. Anything else throws:
                  // scoring a transient failure as zero would silently present
                  // wrong season totals as truth.
                  fetchFplOrNotFound<EntryEventPicksResponse>(
                    FPL_ENDPOINTS.entryEventPicks(entry.entry_id, gameweek),
                    isFinal ? SERVER_TTL.PICKS_FINAL : SERVER_TTL.PICKS_LIVE,
                  ),
                ),
              ),
            ])

            const elementTotals = buildElementCategoryTotals(live)

            entries.forEach((entry, index) => {
              const picks = picksResults[index]?.picks ?? []
              const countedElementIds = picks
                .filter((pick) => pick.position <= STARTING_XI_MAX_POSITION)
                .map((pick) => pick.element)

              const target = totalsByEntryId.get(entry.entry_id)
              if (target)
                addCategoryTotals(target, sumPickCategories(countedElementIds, elementTotals))
            })
          }),
        )
      }

      return entries.map((entry) => ({
        entryApiId: entry.id,
        leagueId: entry.leagueId,
        managerName: participantDisplayName(
          entry.id,
          `${entry.player_first_name} ${entry.player_last_name}`,
        ),
        teamName: entry.entry_name,
        categories: totalsByEntryId.get(entry.entry_id) ?? emptyCategoryTotals(),
      }))
    }),
} satisfies TRPCRouterRecord
