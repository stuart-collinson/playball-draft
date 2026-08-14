import type { EventLiveResponse } from "@pbd/types/fpl.types"

// Draft has no captains: every pick carries multiplier 1, so the counted XI
// is simply positions 1-11. Picks come back re-ordered post-autosub once a
// gameweek finishes, exactly as FPL's own frontend renders them.
export const STARTING_XI_MAX_POSITION = 11

// The scoring categories the breakdown tables report, in display order.
export const SCORING_CATEGORIES = [
  "goals",
  "assists",
  "defcon",
  "saves",
  "cleanSheets",
  "bonus",
] as const

export type ScoringCategory = (typeof SCORING_CATEGORIES)[number]

export type CategoryTotal = { points: number; count: number }

export type CategoryTotals = Record<ScoringCategory, CategoryTotal>

// FPL explain identifiers -> categories. Anything not listed (minutes, cards,
// goals conceded, own goals, penalty misses/saves...) is deliberately ignored.
const EXPLAIN_STAT_CATEGORY: Partial<Record<string, ScoringCategory>> = {
  goals_scored: "goals",
  assists: "assists",
  defensive_contribution: "defcon",
  saves: "saves",
  clean_sheets: "cleanSheets",
  bonus: "bonus",
}

export const emptyCategoryTotals = (): CategoryTotals => ({
  goals: { points: 0, count: 0 },
  assists: { points: 0, count: 0 },
  defcon: { points: 0, count: 0 },
  saves: { points: 0, count: 0 },
  cleanSheets: { points: 0, count: 0 },
  bonus: { points: 0, count: 0 },
})

export const addCategoryTotals = (target: CategoryTotals, source: CategoryTotals): void => {
  for (const category of SCORING_CATEGORIES) {
    target[category].points += source[category].points
    target[category].count += source[category].count
  }
}

// Per-element category totals for one gameweek, summed across the element's
// fixtures (double gameweeks have one explain entry per fixture).
export const buildElementCategoryTotals = (
  live: EventLiveResponse,
): Map<number, CategoryTotals> => {
  const byElement = new Map<number, CategoryTotals>()

  for (const [elementId, element] of Object.entries(live.elements)) {
    const totals = emptyCategoryTotals()
    let scored = false

    for (const [stats] of element.explain ?? []) {
      for (const stat of stats) {
        const category = EXPLAIN_STAT_CATEGORY[stat.stat]
        if (!category) continue
        totals[category].points += stat.points
        totals[category].count += stat.value
        scored = true
      }
    }

    if (scored) byElement.set(Number(elementId), totals)
  }

  return byElement
}

// A manager's category totals for one gameweek: the sum over the players
// whose points counted for them (their post-autosub XI).
export const sumPickCategories = (
  countedElementIds: number[],
  elementTotals: Map<number, CategoryTotals>,
): CategoryTotals => {
  const totals = emptyCategoryTotals()
  for (const elementId of countedElementIds) {
    const elementTotal = elementTotals.get(elementId)
    if (elementTotal) addCategoryTotals(totals, elementTotal)
  }

  return totals
}
