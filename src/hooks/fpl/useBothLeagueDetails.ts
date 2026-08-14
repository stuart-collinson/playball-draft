import { useLeagueDetails } from "@pbd/hooks/fpl/useLeagueDetails"
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl"

// Both leagues' standings — needed wherever a screen shows cross-league
// context (combined totals, overall rank).
export const useBothLeagueDetails = () => {
  const { data: premData } = useLeagueDetails(LEAGUE_IDS.PREMIERSHIP)
  const { data: champData } = useLeagueDetails(LEAGUE_IDS.CHAMPIONSHIP)

  return { premData, champData }
}
