import { streaksTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useStreaksTable = (input: RouterInput["fpl"]["streaksTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(streaksTableOptions(trpc, input))
}
