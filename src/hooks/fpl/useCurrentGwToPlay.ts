import { currentGwToPlayOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLivePollInterval } from "@pbd/hooks/fpl/useLivePollInterval"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

// The leagueIds array is built here rather than by callers so the query key
// stays identical to the one server prefetch warms.
export const useCurrentGwToPlay = (leagueId: number) => {
  const trpc = useTRPC()
  const pollInterval = useLivePollInterval()

  return useSuspenseQuery({
    ...currentGwToPlayOptions(trpc, [leagueId]),
    refetchInterval: pollInterval,
  })
}
