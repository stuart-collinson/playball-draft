import { hasFixtureConcluded } from "@pbd/lib/fpl/fixtures"
import { hours, minutes } from "@pbd/lib/time"
import type { EventLiveFixture, FplEvent } from "@pbd/types/fpl.types"
import type { GamePhase } from "@pbd/types/game.types"

const IMMINENT_BEFORE_KICKOFF_MS = minutes(30)
const IMMINENT_AFTER_KICKOFF_MS = hours(2)
const ESTIMATED_MATCH_DURATION_MS = hours(2)
const POST_MATCH_COOLDOWN_MS = hours(2)

const concludedWithinCooldown = (fixture: EventLiveFixture, nowMs: number): boolean => {
  if (!hasFixtureConcluded(fixture) || !fixture.kickoff_time) return false
  const estimatedFullTime = new Date(fixture.kickoff_time).getTime() + ESTIMATED_MATCH_DURATION_MS
  return nowMs - estimatedFullTime <= POST_MATCH_COOLDOWN_MS
}

export const deriveGamePhase = (fixtures: EventLiveFixture[], now: Date): GamePhase => {
  if (fixtures.some((f) => f.started && !hasFixtureConcluded(f))) return "live"

  const nowMs = now.getTime()
  const unstarted = fixtures.filter((f) => !f.started)

  const kickoffIsImminent = unstarted.some((f) => {
    if (!f.kickoff_time) return false
    const untilKickoff = new Date(f.kickoff_time).getTime() - nowMs
    return untilKickoff <= IMMINENT_BEFORE_KICKOFF_MS && untilKickoff >= -IMMINENT_AFTER_KICKOFF_MS
  })
  if (kickoffIsImminent) return "imminent"

  if (fixtures.some((f) => concludedWithinCooldown(f, nowMs))) return "imminent"

  return unstarted.length === 0 ? "idle" : "break"
}

export const findNextDeadline = (events: FplEvent[], now: Date): string | null => {
  const nowMs = now.getTime()
  const upcoming = events
    .filter((event) => new Date(event.deadline_time).getTime() > nowMs)
    .sort((a, b) => new Date(a.deadline_time).getTime() - new Date(b.deadline_time).getTime())

  return upcoming[0]?.deadline_time ?? null
}
