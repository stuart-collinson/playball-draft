import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { LIVE_POLL_INTERVALS } from "@pbd/lib/freshness"

// refetchInterval for live-tier queries: polls while matches are live or about
// to kick off, silent otherwise. No polling until the first gameState response
// lands, so a cold page never polls on a guess.
export const useLivePollInterval = (): number | false => {
  const { data } = useGameState()

  return data ? LIVE_POLL_INTERVALS[data.phase] : false
}
