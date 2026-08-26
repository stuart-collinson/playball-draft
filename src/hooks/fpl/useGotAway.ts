import { gotAwayOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useGotAway = (input: RouterInput["fpl"]["gotAway"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(gotAwayOptions(trpc, input))
}
