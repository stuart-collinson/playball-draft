import { gameweekPointsFor } from "@pbd/lib/fpl/livePoints"
import type { GoalsAndAssists, Standing } from "@pbd/types/fpl.types"

export type GameweekResult = {
  points: number
  goals: number
  tableRank: number
}

export const compareGameweekResults = (first: GameweekResult, second: GameweekResult): number => {
  if (first.points !== second.points) return second.points - first.points
  if (first.goals !== second.goals) return second.goals - first.goals
  return first.tableRank - second.tableRank
}

export const rankGameweekResults = <T extends GameweekResult>(results: T[]): T[] =>
  [...results].sort(compareGameweekResults)

const standingGameweekResult = (
  standing: Standing,
  returns: Record<number, GoalsAndAssists>,
  livePoints: Record<number, number>,
): GameweekResult => ({
  points: gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]),
  goals: returns[standing.league_entry]?.goals ?? 0,
  tableRank: standing.rank,
})

export const compareStandingsByGameweek =
  (returns: Record<number, GoalsAndAssists>, livePoints: Record<number, number>) =>
  (first: Standing, second: Standing): number =>
    compareGameweekResults(
      standingGameweekResult(first, returns, livePoints),
      standingGameweekResult(second, returns, livePoints),
    )
