import { hours, minutes } from "@pbd/lib/time"
import type { EventLiveFixture, FplEvent } from "@pbd/types/fpl.types"
import type { GamePhase } from "@pbd/types/game.types"

const IMMINENT_BEFORE_KICKOFF_MS = minutes(30)
const IMMINENT_AFTER_KICKOFF_MS = hours(2)

const isSettled = (fixture: EventLiveFixture): boolean =>
  fixture.finished && fixture.finished_provisional

export const deriveGamePhase = (fixtures: EventLiveFixture[], now: Date): GamePhase => {
  if (fixtures.some((f) => f.started && !isSettled(f))) return "live"

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

export const findNextDeadline = (events: FplEvent[], now: Date): string | null => {
  const nowMs = now.getTime()
  const upcoming = events
    .filter((event) => new Date(event.deadline_time).getTime() > nowMs)
    .sort((a, b) => new Date(a.deadline_time).getTime() - new Date(b.deadline_time).getTime())

  return upcoming[0]?.deadline_time ?? null
}
