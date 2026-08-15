import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import type {
  BootstrapStaticResponse,
  EntryHistoryResponse,
  LeagueDetailsResponse,
  LeagueEntry,
} from "@pbd/types/fpl.types"

export type EntryWithLeague = LeagueEntry & { leagueId: number }

export type LeagueEntriesData = {
  allDetails: LeagueDetailsResponse[]
  bootstrap: BootstrapStaticResponse
  entries: EntryWithLeague[]
  finishedGwSet: Set<number>
  currentEvent: number
}

// The prefix every stats procedure starts from: league details plus bootstrap,
// flattened to league-tagged entries and the set of finished gameweeks.
export const fetchLeagueEntries = async (leagueIds: number[]): Promise<LeagueEntriesData> => {
  const [allDetails, bootstrap] = await Promise.all([
    Promise.all(
      leagueIds.map((id) =>
        fetchFpl<LeagueDetailsResponse>(FPL_ENDPOINTS.leagueDetails(id), SERVER_TTL.LEAGUE_DETAILS),
      ),
    ),
    fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
  ])

  const entries = allDetails.flatMap((details, index) =>
    details.league_entries.map((entry) => ({
      ...entry,
      leagueId: leagueIds[index] ?? leagueIds[0] ?? 0,
    })),
  )

  const finishedGwSet = new Set(
    bootstrap.events.data.filter((event) => event.finished).map((event) => event.id),
  )

  return {
    allDetails,
    bootstrap,
    entries,
    finishedGwSet,
    currentEvent: bootstrap.events.current,
  }
}

// Per-gameweek history for each entry, aligned by index with `entries`.
export const fetchEntryHistories = (entries: EntryWithLeague[]): Promise<EntryHistoryResponse[]> =>
  Promise.all(
    entries.map((entry) =>
      fetchFpl<EntryHistoryResponse>(
        FPL_ENDPOINTS.entryHistory(entry.entry_id),
        SERVER_TTL.ENTRY_HISTORY,
      ),
    ),
  )
