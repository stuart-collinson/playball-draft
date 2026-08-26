import { allPlayTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useAllPlayTable = (input: RouterInput["fpl"]["allPlayTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(allPlayTableOptions(trpc, input))
}
