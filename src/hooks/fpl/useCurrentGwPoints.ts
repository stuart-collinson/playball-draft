import { currentGwPointsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { mergeEntryRecords } from "@pbd/lib/fpl/entryRecords"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQueries } from "@tanstack/react-query"

export const useCurrentGwPoints = (leagueIds: number[]): { data: Record<number, number> } => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQueries({
    queries: leagueIds.map((leagueId) => ({
      ...currentGwPointsOptions(trpc, [leagueId]),
      ...liveFreshness,
    })),
    combine: (results) => ({ data: mergeEntryRecords(results.map((result) => result.data)) }),
  })
}
