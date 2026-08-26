import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import type { BootstrapStaticResponse, EntryHistoryResponse } from "@pbd/types/fpl.types"

export type SeasonScoreRow = {
  event: number
  points: number
  totalPoints: number
}

export type SeasonEntry = {
  entryApiId: number
  entryId: number
  leagueId: number
  managerName: string
  teamName: string
  rows: SeasonScoreRow[]
}

export type SeasonScores = {
  finishedEvents: number[]
  stopEvent: number
  entries: SeasonEntry[]
}

const FULL_SEASON_STOP_EVENT = 38

export const fetchSeasonScores = async (leagueIds: number[]): Promise<SeasonScores> => {
  const [allDetails, bootstrap] = await Promise.all([
    Promise.all(leagueIds.map(fetchLeagueDetails)),
    fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
  ])

  const finishedEvents = bootstrap.events.data
    .filter((event) => event.finished)
    .map((event) => event.id)
    .sort((a, b) => a - b)
  const finishedSet = new Set(finishedEvents)

  const stopEvent = allDetails.reduce(
    (max, details) => Math.max(max, details.league.stop_event),
    FULL_SEASON_STOP_EVENT,
  )

  const entriesWithLeague = allDetails.flatMap((details, index) =>
    details.league_entries.map((entry) => ({
      entry,
      leagueId: leagueIds[index] ?? leagueIds[0] ?? 0,
    })),
  )

  const histories = await Promise.all(
    entriesWithLeague.map(({ entry }) =>
      fetchFpl<EntryHistoryResponse>(
        FPL_ENDPOINTS.entryHistory(entry.entry_id),
        SERVER_TTL.ENTRY_HISTORY,
      ),
    ),
  )

  const entries = entriesWithLeague.map(({ entry, leagueId }, index) => ({
    entryApiId: entry.id,
    entryId: entry.entry_id,
    leagueId,
    managerName:
      PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
      PARTICIPANT_BY_API_ID[entry.id]?.name ??
      `${entry.player_first_name} ${entry.player_last_name}`,
    teamName: entry.entry_name,
    rows: (histories[index]?.history ?? [])
      .filter((row) => finishedSet.has(row.event))
      .sort((a, b) => a.event - b.event)
      .map((row) => ({
        event: row.event,
        points: row.points,
        totalPoints: row.total_points,
      })),
  }))

  return { finishedEvents, stopEvent, entries }
}
