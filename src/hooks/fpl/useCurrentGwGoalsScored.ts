import { currentGwGoalsScoredOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useCurrentGwGoalsScored = (leagueId: number) => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQuery({
    ...currentGwGoalsScoredOptions(trpc, [leagueId]),
    ...liveFreshness,
  })
}
