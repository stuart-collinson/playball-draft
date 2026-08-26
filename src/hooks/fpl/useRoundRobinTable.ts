import { roundRobinTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useRoundRobinTable = (input: RouterInput["fpl"]["roundRobinTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(roundRobinTableOptions(trpc, input))
}
