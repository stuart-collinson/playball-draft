import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { gameweekPointsFor } from "@pbd/lib/fpl/gameweek/livePoints"
import type { GameweekReturns, Standing } from "@pbd/types/fpl.types"

export type GameweekResult = {
  points: number
  goals: number
  cleanSheets: number
  goalsConceded: number
  leaguePoints: number
  tablePosition: number
}

const compareBeforeCoinToss = (first: GameweekResult, second: GameweekResult): number =>
  second.points - first.points ||
  second.goals - first.goals ||
  second.cleanSheets - first.cleanSheets ||
  first.goalsConceded - second.goalsConceded ||
  second.leaguePoints - first.leaguePoints

export const compareGameweekResults = (first: GameweekResult, second: GameweekResult): number =>
  compareBeforeCoinToss(first, second) || first.tablePosition - second.tablePosition

export const rankGameweekResults = <T extends GameweekResult>(results: T[]): T[] =>
  [...results].sort(compareGameweekResults)

export const isCoinToss = (first: GameweekResult, second: GameweekResult): boolean =>
  compareBeforeCoinToss(first, second) === 0

const standingGameweekResult = (
  standing: Standing,
  returns: Record<number, GameweekReturns>,
  livePoints: Record<number, number>,
): GameweekResult => {
  const scored = returns[standing.league_entry] ?? NO_GAMEWEEK_RETURNS

  return {
    points: gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]),
    goals: scored.goals,
    cleanSheets: scored.cleanSheets,
    goalsConceded: scored.goalsConceded,
    leaguePoints: standing.total,
    tablePosition: standing.rank_sort,
  }
}

export const compareSeasonTotals = (first: Standing, second: Standing): number =>
  second.total - first.total || first.rank_sort - second.rank_sort

export const compareStandingsByGameweek =
  (returns: Record<number, GameweekReturns>, livePoints: Record<number, number>) =>
  (first: Standing, second: Standing): number =>
    compareGameweekResults(
      standingGameweekResult(first, returns, livePoints),
      standingGameweekResult(second, returns, livePoints),
    )
