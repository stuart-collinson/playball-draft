import { benchTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useBenchTable = (input: RouterInput["fpl"]["benchTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(benchTableOptions(trpc, input))
}
