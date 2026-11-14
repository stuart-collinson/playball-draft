import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import {
  compareLeagueSeasonTotals,
  compareLeagueStandingsByGameweek,
  toLeagueStandings,
} from "@pbd/lib/fpl/gameweek/gameweekResult"
import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { gameweekPointsFor } from "@pbd/lib/fpl/gameweek/livePoints"
import { personSlug } from "@pbd/lib/people"
import type {
  GameweekReturns,
  LeagueDetailsResponse,
  LeagueStanding,
  Standing,
} from "@pbd/types/fpl.types"

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

type ReturnsMap = Record<number, GameweekReturns>

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
): ((first: LeagueStanding, second: LeagueStanding) => number) =>
  seasonOver ? compareLeagueSeasonTotals : compareLeagueStandingsByGameweek(returns, livePoints)

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

  const scored = returns[standing.league_entry] ?? NO_GAMEWEEK_RETURNS

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
  const ranked = toLeagueStandings(details.league.id, details.standings)
    .sort(compareStandings(returns, livePoints, seasonOver))
    .map(({ standing }) => standing)
  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]

  return {
    winner: top ? toOutcomeEntry(details, top, returns, livePoints, seasonOver) : null,
    loser: bottom ? toOutcomeEntry(details, bottom, returns, livePoints, seasonOver) : null,
    total: details.standings.reduce((sum, standing) => sum + standing.total, 0),
  }
}
