import { bestWaiversOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useBestWaivers = (input: RouterInput["fpl"]["bestWaivers"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(bestWaiversOptions(trpc, input))
}
