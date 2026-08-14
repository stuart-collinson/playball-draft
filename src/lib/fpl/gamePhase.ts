import { hours, minutes } from "@pbd/lib/time"
import type { EventLiveFixture } from "@pbd/types/fpl.types"
import type { GamePhase } from "@pbd/types/game.types"

// A kickoff within this window flips the phase to "imminent" so polling
// spins up before the first whistle instead of at the next slow heartbeat.
const IMMINENT_BEFORE_KICKOFF_MS = minutes(30)
// A fixture whose kickoff passed but whose `started` flag hasn't flipped yet
// (FPL data lag) stays imminent — bounded so a postponed fixture with a stale
// kickoff_time can't pin the app in "imminent" forever.
const IMMINENT_AFTER_KICKOFF_MS = hours(2)

export const deriveGamePhase = (fixtures: EventLiveFixture[], now: Date): GamePhase => {
  if (fixtures.some((f) => f.started && !f.finished)) return "live"

  const unstarted = fixtures.filter((f) => !f.started)
  if (unstarted.length === 0) return "idle"

  const nowMs = now.getTime()
  const isImminent = unstarted.some((f) => {
    if (!f.kickoff_time) return false
    const untilKickoff = new Date(f.kickoff_time).getTime() - nowMs
    return untilKickoff <= IMMINENT_BEFORE_KICKOFF_MS && untilKickoff >= -IMMINENT_AFTER_KICKOFF_MS
  })

  return isImminent ? "imminent" : "break"
}

export const findNextKickoff = (fixtures: EventLiveFixture[], now: Date): string | null => {
  const nowMs = now.getTime()
  const upcoming = fixtures
    .filter(
      (f): f is EventLiveFixture & { kickoff_time: string } =>
        !f.started && f.kickoff_time !== null && new Date(f.kickoff_time).getTime() > nowMs,
    )
    .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())

  return upcoming[0]?.kickoff_time ?? null
}
