import { leagueDetailsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { useTRPC } from "@pbd/trpc/react"
import type { LeagueDetailsResponse } from "@pbd/types/fpl.types"
import { useSuspenseQueries } from "@tanstack/react-query"

export const useLeagueDetailsList = (leagueIds: number[]): LeagueDetailsResponse[] => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQueries({
    queries: leagueIds.map((leagueId) => ({
      ...leagueDetailsOptions(trpc, leagueId),
      ...liveFreshness,
    })),
    combine: (results) => results.map((result) => result.data),
  })
}
