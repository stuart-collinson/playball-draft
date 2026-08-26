import { freeAgentXiOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useFreeAgentXi = (input: RouterInput["fpl"]["freeAgentXi"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(freeAgentXiOptions(trpc, input))
}
