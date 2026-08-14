import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails"
import { buildOverallRankMap } from "@pbd/lib/fpl/ranks"
import { useMemo } from "react"

// Cross-league rank by season total, keyed by league_entry. Every table that
// shows an overall rank column reads this one hook instead of rebuilding the
// same map from its own pair of leagueDetails queries.
export const useOverallRankMap = (): Map<number, number> => {
  const { premData, champData } = useBothLeagueDetails()

  return useMemo(
    () => buildOverallRankMap(premData.standings, champData.standings),
    [premData.standings, champData.standings],
  )
}
