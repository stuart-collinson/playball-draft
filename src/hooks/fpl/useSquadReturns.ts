import { squadReturnsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useSquadReturns = (input: RouterInput["fpl"]["squadReturns"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(squadReturnsOptions(trpc, input))
}
