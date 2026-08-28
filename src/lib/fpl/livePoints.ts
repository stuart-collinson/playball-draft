import { resolveStarters } from "@pbd/lib/fpl/toPlay"
import type { FixtureProgress, SquadLookups } from "@pbd/lib/fpl/toPlay"
import type { EntryEventPick } from "@pbd/types/fpl.types"

export type LivePointsLookups = SquadLookups & {
  pointsByElement: Map<number, number>
}

export const sumSquadLivePoints = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: LivePointsLookups,
): number => {
  const pointsFor = (pick: EntryEventPick): number => lookups.pointsByElement.get(pick.element) ?? 0

  return resolveStarters(picks, progress, lookups).reduce(
    (total, resolved) =>
      total +
      pointsFor(resolved.starter) +
      (resolved.substitute ? pointsFor(resolved.substitute) : 0),
    0,
  )
}

export const gameweekPointsFor = (eventTotal: number, livePoints: number | undefined): number =>
  eventTotal > 0 ? eventTotal : (livePoints ?? 0)
