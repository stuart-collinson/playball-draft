import { positionHistoryOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const usePositionHistory = (input: RouterInput["fpl"]["positionHistory"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(positionHistoryOptions(trpc, input))
}
