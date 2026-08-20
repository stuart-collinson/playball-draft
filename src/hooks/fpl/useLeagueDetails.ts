import { leagueDetailsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useLeagueDetails = (leagueId: number) => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQuery({
    ...leagueDetailsOptions(trpc, leagueId),
    ...liveFreshness,
  })
}
