import { useLeagueDetails } from "@pbd/hooks/fpl/useLeagueDetails"
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl"

export const useBothLeagueDetails = () => {
  const { data: premData } = useLeagueDetails(LEAGUE_IDS.PREMIERSHIP)
  const { data: champData } = useLeagueDetails(LEAGUE_IDS.CHAMPIONSHIP)

  return { premData, champData }
}
