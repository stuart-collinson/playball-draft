import { LEAGUE_IDS } from "@pbd/lib/constants/Fpl"
import { compareLeagueSeasonTotals } from "@pbd/lib/fpl/gameweek/gameweekResult"
import type { LeagueStanding, Standing } from "@pbd/types/fpl.types"

const inLeague = (leagueId: number, standings: Standing[]): LeagueStanding[] =>
  standings.map((standing) => ({ leagueId, standing }))

export const buildOverallRankMap = (
  premStandings: Standing[],
  champStandings: Standing[],
): Map<number, number> => {
  const combined = [
    ...inLeague(LEAGUE_IDS.PREMIERSHIP, premStandings),
    ...inLeague(LEAGUE_IDS.CHAMPIONSHIP, champStandings),
  ].sort(compareLeagueSeasonTotals)

  return new Map(combined.map(({ standing }, index) => [standing.league_entry, index + 1]))
}

export const buildLeagueRankMap = (
  premStandings: Standing[],
  champStandings: Standing[],
): Map<number, number> =>
  new Map(
    [...premStandings, ...champStandings].map((standing) => [standing.league_entry, standing.rank]),
  )
