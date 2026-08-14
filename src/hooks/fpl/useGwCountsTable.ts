import { gwCountsTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useGwCountsTable = (input: RouterInput["fpl"]["gwCountsTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(gwCountsTableOptions(trpc, input))
}
