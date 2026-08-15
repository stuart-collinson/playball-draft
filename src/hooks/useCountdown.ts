import { hasElapsed, toCountdown } from "@pbd/lib/countdown"
import type { Countdown } from "@pbd/lib/countdown"
import { useEffect, useState } from "react"

const TICK_INTERVAL_MS = 1000

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
