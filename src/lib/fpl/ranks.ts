import type { Standing } from "@pbd/types/fpl.types"

// Overall rank across both leagues: every entry sorted by season total. Copies
// before sorting so the caller's standings (query cache data) are never mutated.
export const buildOverallRankMap = (
  premStandings: Standing[],
  champStandings: Standing[],
): Map<number, number> => {
  const combined = [...premStandings, ...champStandings].sort((a, b) => b.total - a.total)

  return new Map(combined.map((s, index) => [s.league_entry, index + 1]))
}

// Each entry's rank within its own league, as reported by FPL.
export const buildLeagueRankMap = (
  premStandings: Standing[],
  champStandings: Standing[],
): Map<number, number> =>
  new Map([...premStandings, ...champStandings].map((s) => [s.league_entry, s.rank]))
