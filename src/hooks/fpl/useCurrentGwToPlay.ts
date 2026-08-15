import { currentGwToPlayOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLivePollInterval } from "@pbd/hooks/fpl/useLivePollInterval"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useCurrentGwToPlay = (leagueId: number) => {
  const trpc = useTRPC()
  const pollInterval = useLivePollInterval()

  return useSuspenseQuery({
    ...currentGwToPlayOptions(trpc, [leagueId]),
    refetchInterval: pollInterval,
  })
}
