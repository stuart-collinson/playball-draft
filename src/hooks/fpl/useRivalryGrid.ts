import { rivalryGridOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useRivalryGrid = (input: RouterInput["fpl"]["rivalryGrid"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(rivalryGridOptions(trpc, input))
}
