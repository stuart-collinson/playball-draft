import { LEAGUE_IDS_IN_ORDER } from "@pbd/lib/constants/Fpl"
import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { gameweekPointsFor } from "@pbd/lib/fpl/gameweek/livePoints"
import type { GameweekReturns, LeagueStanding, Standing } from "@pbd/types/fpl.types"

export type GameweekResult = {
  points: number
  goals: number
  cleanSheets: number
  goalsConceded: number
  leaguePoints: number
  tablePosition: number
}

type GameweekResultSources = {
  points: number
  returns: GameweekReturns
  leaguePoints: number
  tablePosition: number
}

const UNLISTED_LEAGUE_ORDER = LEAGUE_IDS_IN_ORDER.length

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

export const toGameweekResult = ({
  points,
  returns,
  leaguePoints,
  tablePosition,
}: GameweekResultSources): GameweekResult => ({
  points,
  goals: returns.goals,
  cleanSheets: returns.cleanSheets,
  goalsConceded: returns.goalsConceded,
  leaguePoints,
  tablePosition,
})

const standingGameweekResult = (
  standing: Standing,
  returns: Record<number, GameweekReturns>,
  livePoints: Record<number, number>,
): GameweekResult =>
  toGameweekResult({
    points: gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]),
    returns: returns[standing.league_entry] ?? NO_GAMEWEEK_RETURNS,
    leaguePoints: standing.total,
    tablePosition: standing.rank_sort,
  })

export const toLeagueStandings = (leagueId: number, standings: Standing[]): LeagueStanding[] =>
  standings.map((standing) => ({ leagueId, standing }))

const leagueOrderFor = (leagueId: number): number => {
  const order = LEAGUE_IDS_IN_ORDER.indexOf(leagueId)
  return order === -1 ? UNLISTED_LEAGUE_ORDER : order
}

const compareLeagueTablePositions = (first: LeagueStanding, second: LeagueStanding): number =>
  leagueOrderFor(first.leagueId) - leagueOrderFor(second.leagueId) ||
  first.standing.rank_sort - second.standing.rank_sort

export const compareLeagueSeasonTotals = (first: LeagueStanding, second: LeagueStanding): number =>
  second.standing.total - first.standing.total || compareLeagueTablePositions(first, second)

export const compareLeagueStandingsByGameweek =
  (returns: Record<number, GameweekReturns>, livePoints: Record<number, number>) =>
  (first: LeagueStanding, second: LeagueStanding): number =>
    compareBeforeCoinToss(
      standingGameweekResult(first.standing, returns, livePoints),
      standingGameweekResult(second.standing, returns, livePoints),
    ) || compareLeagueTablePositions(first, second)
