import "server-only"

import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { findTiedGameweeks, resolveGameweekVerdicts } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type {
  GameweekScore,
  GameweekVerdict,
  TiedGameweek,
} from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry, SeasonScores } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import type { GameweekReturns } from "@pbd/types/fpl.types"

export type GameweekVerdicts = {
  verdicts: GameweekVerdict[]
  season: SeasonScores
}

const returnsKey = (entryApiId: number, event: number): string => `${entryApiId}-${event}`

const fetchTiedReturns = async (
  entries: SeasonEntry[],
  tied: TiedGameweek[],
): Promise<Map<string, GameweekReturns>> => {
  if (tied.length === 0) return new Map()

  const tiedApiIds = new Set(tied.flatMap((week) => week.entryApiIds))
  const statsByEntry = await fetchSquadWeekStats(
    entries
      .filter((entry) => tiedApiIds.has(entry.entryApiId))
      .map(({ entryApiId, entryId }) => ({ entryApiId, entryId })),
    tied.map((week) => week.event),
  )

  return new Map(
    [...statsByEntry].flatMap(([entryApiId, squadWeeks]) =>
      squadWeeks.map((week) => [returnsKey(entryApiId, week.event), week.returns] as const),
    ),
  )
}

export const fetchGameweekVerdicts = async (leagueIds: number[]): Promise<GameweekVerdicts> => {
  const [season, allDetails] = await Promise.all([
    fetchSeasonScores(leagueIds),
    Promise.all(leagueIds.map(fetchLeagueDetails)),
  ])

  const scores: GameweekScore[] = season.entries.flatMap((entry) =>
    entry.rows.map((row) => ({
      entryApiId: entry.entryApiId,
      leagueId: entry.leagueId,
      event: row.event,
      points: row.points,
      leaguePoints: row.totalPoints,
    })),
  )
  const tablePositions = new Map(
    allDetails.flatMap((details) =>
      details.standings.map((standing) => [standing.league_entry, standing.rank_sort] as const),
    ),
  )
  const returns = await fetchTiedReturns(season.entries, findTiedGameweeks(scores))

  const verdicts = resolveGameweekVerdicts(scores, {
    returnsFor: (entryApiId, event) =>
      returns.get(returnsKey(entryApiId, event)) ?? NO_GAMEWEEK_RETURNS,
    tablePositionFor: (entryApiId) => tablePositions.get(entryApiId) ?? null,
  })

  return { verdicts, season }
}
