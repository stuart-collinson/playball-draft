import { tinkerTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useTinkerTable = (input: RouterInput["fpl"]["tinkerTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(tinkerTableOptions(trpc, input))
}
