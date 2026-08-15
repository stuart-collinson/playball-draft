import { bestTradesOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useBestTrades = (input: RouterInput["fpl"]["bestTrades"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(bestTradesOptions(trpc, input))
}
