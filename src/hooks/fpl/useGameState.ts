import { gameStateOptions } from "@pbd/hooks/fpl/fpl.cache"
import { GAME_STATE_POLL_INTERVALS, GAME_STATE_RETRY_INTERVAL } from "@pbd/lib/freshness"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

// The app's heartbeat: schedules its own next check from the phase it just
// observed, so polling spins up for kickoffs and winds down overnight without
// any live-tier query needing to be mounted. Only ticks while a screen is
// open — nothing runs when nobody is using the app.
export const useGameState = () => {
  const trpc = useTRPC()

  return useQuery({
    ...gameStateOptions(trpc),
    refetchInterval: (query) => {
      const phase = query.state.data?.phase
      // Never seen a successful response: retry soon rather than assuming the
      // quietest phase, which would stall recovery for 15 minutes.
      if (!phase) return GAME_STATE_RETRY_INTERVAL
      return GAME_STATE_POLL_INTERVALS[phase]
    },
  })
}
