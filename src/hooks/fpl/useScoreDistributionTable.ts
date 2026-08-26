import { scoreDistributionTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useScoreDistributionTable = (input: RouterInput["fpl"]["scoreDistributionTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(scoreDistributionTableOptions(trpc, input))
}
