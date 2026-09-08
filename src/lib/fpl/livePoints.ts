import { scoringPicks } from "@pbd/lib/fpl/toPlay"
import type { FixtureProgress, SquadLookups } from "@pbd/lib/fpl/toPlay"
import type { EntryEventPick } from "@pbd/types/fpl.types"

export type LivePointsLookups = SquadLookups & {
  pointsByElement: Map<number, number>
}

export const sumSquadLivePoints = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: LivePointsLookups,
): number =>
  scoringPicks(picks, progress, lookups).reduce(
    (total, pick) => total + (lookups.pointsByElement.get(pick.element) ?? 0),
    0,
  )

export const gameweekPointsFor = (eventTotal: number, livePoints: number | undefined): number =>
  eventTotal > 0 ? eventTotal : (livePoints ?? 0)
