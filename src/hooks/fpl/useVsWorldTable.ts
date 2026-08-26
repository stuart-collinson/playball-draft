import { vsWorldTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useVsWorldTable = (input: RouterInput["fpl"]["vsWorldTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(vsWorldTableOptions(trpc, input))
}
