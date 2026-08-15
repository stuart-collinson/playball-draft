const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

export type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Splits a remaining duration into whole days/hours/minutes/seconds. Anything
// in the past clamps to zero rather than counting upwards.
export const toCountdown = (remainingMs: number): Countdown => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))

  return {
    days: Math.floor(totalSeconds / SECONDS_PER_DAY),
    hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  }
}

export const hasElapsed = (countdown: Countdown): boolean =>
  countdown.days === 0 &&
  countdown.hours === 0 &&
  countdown.minutes === 0 &&
  countdown.seconds === 0
