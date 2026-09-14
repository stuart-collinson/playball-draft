import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import { managerNameForApiId } from "@pbd/lib/people"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import type { EntryHistoryResponse } from "@pbd/types/fpl.types"

type SeasonScoreRow = {
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

export type SeasonEntryMeta = Pick<
  SeasonEntry,
  "entryApiId" | "leagueId" | "managerName" | "teamName"
>

export const buildMetaLookup = (
  entries: SeasonEntry[],
): ((entryApiId: number) => SeasonEntryMeta) => {
  const byId = new Map(
    entries.map((entry) => [
      entry.entryApiId,
      {
        entryApiId: entry.entryApiId,
        leagueId: entry.leagueId,
        managerName: entry.managerName,
        teamName: entry.teamName,
      },
    ]),
  )

  return (entryApiId) =>
    byId.get(entryApiId) ?? {
      entryApiId,
      leagueId: 0,
      managerName: `Entry ${entryApiId}`,
      teamName: "",
    }
}

const FULL_SEASON_STOP_EVENT = 38

export const fetchSeasonScores = async (leagueIds: number[]): Promise<SeasonScores> => {
  const [allDetails, bootstrap] = await Promise.all([
    Promise.all(leagueIds.map(fetchLeagueDetails)),
    fetchBootstrapStatic(),
  ])

  const finishedEvents = finishedEventIds(bootstrap)
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
    managerName: managerNameForApiId(
      entry.id,
      `${entry.player_first_name} ${entry.player_last_name}`,
    ),
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
