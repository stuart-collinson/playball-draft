import { currentGwGoalsAndAssistsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { mergeEntryRecords } from "@pbd/lib/fpl/entryRecords"
import { useTRPC } from "@pbd/trpc/react"
import type { GoalsAndAssists } from "@pbd/types/fpl.types"
import { useSuspenseQueries } from "@tanstack/react-query"

export const useCurrentGwGoalsAndAssists = (
  leagueIds: number[],
): { data: Record<number, GoalsAndAssists> } => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQueries({
    queries: leagueIds.map((leagueId) => ({
      ...currentGwGoalsAndAssistsOptions(trpc, [leagueId]),
      ...liveFreshness,
    })),
    combine: (results) => ({ data: mergeEntryRecords(results.map((result) => result.data)) }),
  })
}
