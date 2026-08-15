import { gwLeaderboardOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useGwLeaderboard = (input: RouterInput["fpl"]["gwLeaderboard"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(gwLeaderboardOptions(trpc, input))
}
