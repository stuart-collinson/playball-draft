import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { gameweekPointsFor } from "@pbd/lib/fpl/livePoints"
import { personSlug } from "@pbd/lib/people"
import type { LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types"

export type OutcomeEntry = {
  apiId: number
  slug: string
  name: string
  points: number
  image: string | null
}

export type LeagueOutcome = {
  winner: OutcomeEntry | null
  loser: OutcomeEntry | null
  total: number
}

type PointsMap = Record<number, number>

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
  goals: PointsMap,
  livePoints: PointsMap,
  seasonOver: boolean,
): ((first: Standing, second: Standing) => number) => {
  const gameweekPoints = (standing: Standing): number =>
    gameweekPointsFor(standing.event_total, livePoints[standing.league_entry])

  return (first, second) => {
    if (seasonOver) return second.total - first.total
    const pointsDiff = gameweekPoints(second) - gameweekPoints(first)
    if (pointsDiff !== 0) return pointsDiff
    return (goals[second.league_entry] ?? 0) - (goals[first.league_entry] ?? 0)
  }
}

const toOutcomeEntry = (
  details: LeagueDetailsResponse,
  standing: Standing,
  livePoints: PointsMap,
  seasonOver: boolean,
): OutcomeEntry => {
  const participant = PARTICIPANT_BY_API_ID[standing.league_entry]
  const entry = details.league_entries.find((candidate) => candidate.id === standing.league_entry)
  const fullName =
    participant?.name ??
    (entry ? `${entry.player_first_name} ${entry.player_last_name}` : "Unknown")

  return {
    apiId: standing.league_entry,
    slug: personSlug(fullName),
    name: participant?.nickname ?? fullName,
    points: seasonOver
      ? standing.total
      : gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]),
    image: participant?.image ?? null,
  }
}

export const resolveLeagueOutcome = (
  details: LeagueDetailsResponse,
  goals: PointsMap,
  livePoints: PointsMap,
  seasonOver: boolean,
): LeagueOutcome => {
  const ranked = [...details.standings].sort(compareStandings(goals, livePoints, seasonOver))
  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]

  return {
    winner: top ? toOutcomeEntry(details, top, livePoints, seasonOver) : null,
    loser: bottom ? toOutcomeEntry(details, bottom, livePoints, seasonOver) : null,
    total: details.standings.reduce((sum, standing) => sum + standing.total, 0),
  }
}
