import {
  currentGwGoalsScoredOptions,
  currentGwPointsOptions,
  leagueDetailsOptions,
} from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useGameweekSnapshot = () => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  const premDetails = useQuery({
    ...leagueDetailsOptions(trpc, LEAGUE_IDS.PREMIERSHIP),
    ...liveFreshness,
  })
  const champDetails = useQuery({
    ...leagueDetailsOptions(trpc, LEAGUE_IDS.CHAMPIONSHIP),
    ...liveFreshness,
  })
  const premGoals = useQuery({
    ...currentGwGoalsScoredOptions(trpc, [LEAGUE_IDS.PREMIERSHIP]),
    ...liveFreshness,
  })
  const champGoals = useQuery({
    ...currentGwGoalsScoredOptions(trpc, [LEAGUE_IDS.CHAMPIONSHIP]),
    ...liveFreshness,
  })

  const premPoints = useQuery({
    ...currentGwPointsOptions(trpc, [LEAGUE_IDS.PREMIERSHIP]),
    ...liveFreshness,
  })
  const champPoints = useQuery({
    ...currentGwPointsOptions(trpc, [LEAGUE_IDS.CHAMPIONSHIP]),
    ...liveFreshness,
  })

  return { premDetails, champDetails, premGoals, champGoals, premPoints, champPoints }
}
