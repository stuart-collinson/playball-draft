import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails"
import { buildLeagueRankMap, buildOverallRankMap } from "@pbd/lib/fpl/ranks"
import { useMemo } from "react"

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
