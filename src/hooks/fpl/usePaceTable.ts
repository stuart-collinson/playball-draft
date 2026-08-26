import { paceTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const usePaceTable = (input: RouterInput["fpl"]["paceTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(paceTableOptions(trpc, input))
}
