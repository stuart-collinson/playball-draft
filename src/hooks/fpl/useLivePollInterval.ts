import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { LIVE_POLL_INTERVALS } from "@pbd/lib/freshness"

export const useLivePollInterval = (): number | false => {
  const { data } = useGameState()

  return data ? LIVE_POLL_INTERVALS[data.phase] : false
}
