import "server-only"

import { findTiedGameweeks, resolveGameweekVerdicts } from "@pbd/lib/fpl/gameweekVerdicts"
import type { GameweekScore, GameweekVerdict, TiedGameweek } from "@pbd/lib/fpl/gameweekVerdicts"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry, SeasonScores } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"

export type GameweekVerdicts = {
  verdicts: GameweekVerdict[]
  season: SeasonScores
}

const goalsKey = (entryApiId: number, event: number): string => `${entryApiId}-${event}`

const fetchTiedGoals = async (
  entries: SeasonEntry[],
  tied: TiedGameweek[],
): Promise<Map<string, number>> => {
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
      squadWeeks.map((week) => [goalsKey(entryApiId, week.event), week.starterGoals] as const),
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
    })),
  )
  const tableRanks = new Map(
    allDetails.flatMap((details) =>
      details.standings.map((standing) => [standing.league_entry, standing.rank] as const),
    ),
  )
  const goals = await fetchTiedGoals(season.entries, findTiedGameweeks(scores))

  const verdicts = resolveGameweekVerdicts(scores, {
    goalsFor: (entryApiId, event) => goals.get(goalsKey(entryApiId, event)) ?? 0,
    tableRankFor: (entryApiId) => tableRanks.get(entryApiId) ?? null,
  })

  return { verdicts, season }
}
