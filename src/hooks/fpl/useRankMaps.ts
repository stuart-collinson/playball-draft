import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails"
import { buildLeagueRankMap, buildOverallRankMap } from "@pbd/lib/fpl/ranks"
import { useMemo } from "react"

// Rank lookups keyed by league_entry: overall position across both leagues,
// and position within the entry's own league. Every table that shows a rank
// column reads this one hook instead of rebuilding the same maps from its own
// pair of leagueDetails queries.
export const useRankMaps = (): {
  overallRankMap: Map<number, number>
  leagueRankMap: Map<number, number>
} => {
  const { premData, champData } = useBothLeagueDetails()

  const overallRankMap = useMemo(
    () => buildOverallRankMap(premData.standings, champData.standings),
    [premData.standings, champData.standings],
  )

  const leagueRankMap = useMemo(
    () => buildLeagueRankMap(premData.standings, champData.standings),
    [premData.standings, champData.standings],
  )

  return { overallRankMap, leagueRankMap }
}
