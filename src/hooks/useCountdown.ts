import { hasElapsed, toCountdown } from "@pbd/lib/countdown"
import type { Countdown } from "@pbd/lib/countdown"
import { useEffect, useState } from "react"

const TICK_INTERVAL_MS = 1000

// Ticks once a second towards an ISO timestamp. Returns null until the first
// client tick — the server has no meaningful "now" to render, and emitting one
// would produce a hydration mismatch against the browser a moment later.
export const useCountdown = (target: string | null): Countdown | null => {
  const [countdown, setCountdown] = useState<Countdown | null>(null)

  useEffect(() => {
    if (!target) {
      setCountdown(null)
      return
    }

    const targetMs = new Date(target).getTime()
    if (Number.isNaN(targetMs)) {
      setCountdown(null)
      return
    }

    // Each tick builds a fresh object, so React can't bail out on equality —
    // stop the timer once it has run down rather than re-rendering zeros every
    // second until the component unmounts.
    const tick = () => {
      const next = toCountdown(targetMs - Date.now())
      setCountdown(next)
      if (hasElapsed(next)) clearInterval(timer)
    }

    const timer = setInterval(tick, TICK_INTERVAL_MS)
    tick()

    return () => clearInterval(timer)
  }, [target])

  return countdown
}
