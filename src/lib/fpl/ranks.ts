import type { Standing } from "@pbd/types/fpl.types"

export const buildOverallRankMap = (
  premStandings: Standing[],
  champStandings: Standing[],
): Map<number, number> => {
  const combined = [...premStandings, ...champStandings].sort((a, b) => b.total - a.total)

  return new Map(combined.map((s, index) => [s.league_entry, index + 1]))
}

export const buildLeagueRankMap = (
  premStandings: Standing[],
  champStandings: Standing[],
): Map<number, number> =>
  new Map([...premStandings, ...champStandings].map((s) => [s.league_entry, s.rank]))
