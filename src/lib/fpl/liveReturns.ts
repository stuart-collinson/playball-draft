import { scoringPicks } from "@pbd/lib/fpl/toPlay"
import type { FixtureProgress, SquadLookups } from "@pbd/lib/fpl/toPlay"
import type { EntryEventPick, GoalsAndAssists } from "@pbd/types/fpl.types"

export type LiveReturnsLookups = SquadLookups & {
  returnsByElement: Map<number, GoalsAndAssists>
}

const NO_RETURNS: GoalsAndAssists = { goals: 0, assists: 0 }

export const sumSquadLiveReturns = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: LiveReturnsLookups,
): GoalsAndAssists =>
  scoringPicks(picks, progress, lookups).reduce<GoalsAndAssists>((totals, pick) => {
    const scored = lookups.returnsByElement.get(pick.element) ?? NO_RETURNS
    return { goals: totals.goals + scored.goals, assists: totals.assists + scored.assists }
  }, NO_RETURNS)
