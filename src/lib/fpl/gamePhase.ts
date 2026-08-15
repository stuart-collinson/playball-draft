import { hours, minutes } from "@pbd/lib/time"
import type { EventLiveFixture, FplEvent } from "@pbd/types/fpl.types"
import type { GamePhase } from "@pbd/types/game.types"

// A kickoff within this window flips the phase to "imminent" so polling
// spins up before the first whistle instead of at the next slow heartbeat.
const IMMINENT_BEFORE_KICKOFF_MS = minutes(30)
// A fixture whose kickoff passed but whose `started` flag hasn't flipped yet
// (FPL data lag) stays imminent — bounded so a postponed fixture with a stale
// kickoff_time can't pin the app in "imminent" forever.
const IMMINENT_AFTER_KICKOFF_MS = hours(2)

// Bonus points and stat corrections land after the whistle, so a fixture is
// only done once BOTH finished flags are set. FPL's ordering between the two
// isn't something to depend on, hence requiring both rather than picking one.
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

// The soonest gameweek deadline still in the future. Used before a season
// starts, when there is no current gameweek to report on and the only useful
// thing to show is how long until the first one locks.
export const findNextDeadline = (events: FplEvent[], now: Date): string | null => {
  const nowMs = now.getTime()
  const upcoming = events
    .filter((event) => new Date(event.deadline_time).getTime() > nowMs)
    .sort((a, b) => new Date(a.deadline_time).getTime() - new Date(b.deadline_time).getTime())

  return upcoming[0]?.deadline_time ?? null
}
