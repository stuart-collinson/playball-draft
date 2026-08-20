import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { FRESHNESS, LIVE_FRESHNESS, LIVE_POLL_INTERVALS } from "@pbd/lib/freshness"
import type { FreshnessWindow } from "@pbd/lib/freshness"

type LiveFreshness = FreshnessWindow & {
  refetchInterval: number | false
}

export const useLiveFreshness = (): LiveFreshness => {
  const { data } = useGameState()

  if (!data) return { refetchInterval: false, ...FRESHNESS.live }

  return {
    refetchInterval: LIVE_POLL_INTERVALS[data.phase],
    ...LIVE_FRESHNESS[data.phase],
  }
}
