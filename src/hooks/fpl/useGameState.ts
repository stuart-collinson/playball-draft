import { gameStateOptions } from "@pbd/hooks/fpl/fpl.cache"
import { GAME_STATE_POLL_INTERVALS, GAME_STATE_RETRY_INTERVAL } from "@pbd/lib/freshness"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useGameState = () => {
  const trpc = useTRPC()

  return useQuery({
    ...gameStateOptions(trpc),
    refetchInterval: (query) => {
      const phase = query.state.data?.phase
      if (!phase) return GAME_STATE_RETRY_INTERVAL
      return GAME_STATE_POLL_INTERVALS[phase]
    },
  })
}
