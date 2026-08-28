import { currentGwPointsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useCurrentGwPoints = (leagueId: number) => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQuery({
    ...currentGwPointsOptions(trpc, [leagueId]),
    ...liveFreshness,
  })
}
