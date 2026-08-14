import { toCountdown } from "@pbd/lib/countdown"
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

    const tick = () => setCountdown(toCountdown(targetMs - Date.now()))

    tick()
    const timer = setInterval(tick, TICK_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [target])

  return countdown
}
