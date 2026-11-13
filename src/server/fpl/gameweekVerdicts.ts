import "server-only"

import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { findTiedGameweeks, resolveGameweekVerdicts } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type {
  GameweekScore,
  GameweekVerdict,
  TiedGameweek,
} from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import { fetchSeasonScoresWithLeagues } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry, SeasonScores } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import type { GameweekReturns, LeagueDetailsResponse } from "@pbd/types/fpl.types"

export type GameweekVerdicts = {
  verdicts: GameweekVerdict[]
  scores: GameweekScore[]
  season: SeasonScores
  leagueDetails: LeagueDetailsResponse[]
  eventsMissingPicks: number[]
}

type VerdictScope = {
  events?: number[]
}

type TiedReturns = {
  returns: Map<string, GameweekReturns>
  eventsMissingPicks: number[]
}

const returnsKey = (entryApiId: number, event: number): string => `${entryApiId}-${event}`

const fetchTiedReturns = async (
  entries: SeasonEntry[],
  tied: TiedGameweek[],
): Promise<TiedReturns> => {
  if (tied.length === 0) return { returns: new Map(), eventsMissingPicks: [] }

  const statsByTiedWeek = await Promise.all(
    tied.map((week) =>
      fetchSquadWeekStats(
        entries
          .filter((entry) => week.entryApiIds.includes(entry.entryApiId))
          .map(({ entryApiId, entryId }) => ({ entryApiId, entryId })),
        [week.event],
      ),
    ),
  )

  const returns = new Map(
    statsByTiedWeek.flatMap((statsByEntry) =>
      [...statsByEntry].flatMap(([entryApiId, squadWeeks]) =>
        squadWeeks
          .filter((week) => week.hasPicks)
          .map((week) => [returnsKey(entryApiId, week.event), week.returns] as const),
      ),
    ),
  )

  return {
    returns,
    eventsMissingPicks: tied
      .filter((week) =>
        week.entryApiIds.some((entryApiId) => !returns.has(returnsKey(entryApiId, week.event))),
      )
      .map((week) => week.event),
  }
}

const toGameweekScores = (entries: SeasonEntry[]): GameweekScore[] =>
  entries.flatMap((entry) =>
    entry.rows.map((row) => ({
      entryApiId: entry.entryApiId,
      leagueId: entry.leagueId,
      event: row.event,
      points: row.points,
      leaguePoints: row.totalPoints,
    })),
  )

export const fetchGameweekVerdicts = async (
  leagueIds: number[],
  { events }: VerdictScope = {},
): Promise<GameweekVerdicts> => {
  const { season, leagueDetails } = await fetchSeasonScoresWithLeagues(leagueIds)

  const seasonScores = toGameweekScores(season.entries)
  const scores =
    events === undefined
      ? seasonScores
      : seasonScores.filter((score) => events.includes(score.event))
  const tablePositions = new Map(
    leagueDetails.flatMap((details) =>
      details.standings.map((standing) => [standing.league_entry, standing.rank_sort] as const),
    ),
  )
  const { returns, eventsMissingPicks } = await fetchTiedReturns(
    season.entries,
    findTiedGameweeks(scores),
  )

  const verdicts = resolveGameweekVerdicts(scores, {
    returnsFor: (entryApiId, event) =>
      returns.get(returnsKey(entryApiId, event)) ?? NO_GAMEWEEK_RETURNS,
    tablePositionFor: (entryApiId) => tablePositions.get(entryApiId) ?? null,
  })

  return { verdicts, scores, season, leagueDetails, eventsMissingPicks }
}
