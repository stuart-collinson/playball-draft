import { currentGwGoalsScoredOptions, leagueDetailsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLivePollInterval } from "@pbd/hooks/fpl/useLivePollInterval"
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useGameweekSnapshot = () => {
  const trpc = useTRPC()
  const pollInterval = useLivePollInterval()

  const premDetails = useQuery({
    ...leagueDetailsOptions(trpc, LEAGUE_IDS.PREMIERSHIP),
    refetchInterval: pollInterval,
  })
  const champDetails = useQuery({
    ...leagueDetailsOptions(trpc, LEAGUE_IDS.CHAMPIONSHIP),
    refetchInterval: pollInterval,
  })
  const premGoals = useQuery({
    ...currentGwGoalsScoredOptions(trpc, [LEAGUE_IDS.PREMIERSHIP]),
    refetchInterval: pollInterval,
  })
  const champGoals = useQuery({
    ...currentGwGoalsScoredOptions(trpc, [LEAGUE_IDS.CHAMPIONSHIP]),
    refetchInterval: pollInterval,
  })

  return { premDetails, champDetails, premGoals, champGoals }
}
