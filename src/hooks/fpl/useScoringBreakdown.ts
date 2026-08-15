import { scoringBreakdownOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useScoringBreakdown = (leagueIds: number[]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(scoringBreakdownOptions(trpc, leagueIds))
}
