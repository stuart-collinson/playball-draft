import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { compareGameweekResults } from "@pbd/lib/fpl/gameweekResult"
import type { GameweekResult } from "@pbd/lib/fpl/gameweekResult"
import { gameweekPointsFor } from "@pbd/lib/fpl/livePoints"
import { personSlug } from "@pbd/lib/people"
import type { GoalsAndAssists, LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types"

export type OutcomeEntry = {
  apiId: number
  slug: string
  name: string
  points: number
  goals: number
  assists: number
  image: string | null
}

export type LeagueOutcome = {
  winner: OutcomeEntry | null
  loser: OutcomeEntry | null
  total: number
}

type PointsMap = Record<number, number>

type ReturnsMap = Record<number, GoalsAndAssists>

const NO_RETURNS: GoalsAndAssists = { goals: 0, assists: 0 }

export const hasNoScoresYet = (
  standings: Standing[],
  livePoints: PointsMap,
  seasonOver: boolean,
): boolean =>
  !seasonOver &&
  standings.every(
    (standing) => gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]) === 0,
  )

const compareStandings = (
  returns: ReturnsMap,
  livePoints: PointsMap,
  seasonOver: boolean,
): ((first: Standing, second: Standing) => number) => {
  const toResult = (standing: Standing): GameweekResult => ({
    points: gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]),
    goals: returns[standing.league_entry]?.goals ?? NO_RETURNS.goals,
    tableRank: standing.rank,
  })

  return (first, second) => {
    if (seasonOver) return second.total - first.total
    return compareGameweekResults(toResult(first), toResult(second))
  }
}

const toOutcomeEntry = (
  details: LeagueDetailsResponse,
  standing: Standing,
  returns: ReturnsMap,
  livePoints: PointsMap,
  seasonOver: boolean,
): OutcomeEntry => {
  const participant = PARTICIPANT_BY_API_ID[standing.league_entry]
  const entry = details.league_entries.find((candidate) => candidate.id === standing.league_entry)
  const fullName =
    participant?.name ??
    (entry ? `${entry.player_first_name} ${entry.player_last_name}` : "Unknown")

  const scored = returns[standing.league_entry] ?? NO_RETURNS

  return {
    apiId: standing.league_entry,
    slug: personSlug(fullName),
    name: participant?.nickname ?? fullName,
    points: seasonOver
      ? standing.total
      : gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]),
    goals: scored.goals,
    assists: scored.assists,
    image: participant?.image ?? null,
  }
}

export const resolveLeagueOutcome = (
  details: LeagueDetailsResponse,
  returns: ReturnsMap,
  livePoints: PointsMap,
  seasonOver: boolean,
): LeagueOutcome => {
  const ranked = [...details.standings].sort(compareStandings(returns, livePoints, seasonOver))
  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]

  return {
    winner: top ? toOutcomeEntry(details, top, returns, livePoints, seasonOver) : null,
    loser: bottom ? toOutcomeEntry(details, bottom, returns, livePoints, seasonOver) : null,
    total: details.standings.reduce((sum, standing) => sum + standing.total, 0),
  }
}
