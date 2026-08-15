import { awardsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useAwards = (leagueIds: number[]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(awardsOptions(trpc, leagueIds))
}
