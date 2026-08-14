import {
  addCategoryTotals,
  buildElementCategoryTotals,
  emptyCategoryTotals,
  sumPickCategories,
} from "@pbd/lib/fpl/scoring"
import type { EventLiveExplainEntry, EventLiveResponse } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const explainStat = (stat: string, points: number, value: number) => ({
  name: stat,
  points,
  value,
  stat,
})

const live = (elements: Record<string, EventLiveExplainEntry[]>): EventLiveResponse => ({
  elements: Object.fromEntries(
    Object.entries(elements).map(([id, explain]) => [
      id,
      { stats: { minutes: 90, goals_scored: 0, total_points: 0 }, explain },
    ]),
  ),
  fixtures: [],
})

describe("buildElementCategoryTotals", () => {
  it("splits an element's gameweek into the reported categories", () => {
    const totals = buildElementCategoryTotals(
      live({
        "10": [
          [
            [
              explainStat("minutes", 2, 90),
              explainStat("goals_scored", 8, 2),
              explainStat("assists", 3, 1),
              explainStat("bonus", 3, 3),
            ],
            101,
          ],
        ],
      }),
    )

    const element = totals.get(10)
    expect(element?.goals).toEqual({ points: 8, count: 2 })
    expect(element?.assists).toEqual({ points: 3, count: 1 })
    expect(element?.bonus).toEqual({ points: 3, count: 3 })
    // Minutes are deliberately not a reported category.
    expect(element?.defcon).toEqual({ points: 0, count: 0 })
  })

  it("sums both fixtures of a double gameweek", () => {
    const totals = buildElementCategoryTotals(
      live({
        "10": [
          [[explainStat("goals_scored", 4, 1)], 101],
          [[explainStat("goals_scored", 8, 2)], 102],
        ],
      }),
    )

    expect(totals.get(10)?.goals).toEqual({ points: 12, count: 3 })
  })

  it("tracks defensive contributions, saves and clean sheets", () => {
    const totals = buildElementCategoryTotals(
      live({
        "7": [
          [
            [
              explainStat("defensive_contribution", 2, 12),
              explainStat("saves", 2, 6),
              explainStat("clean_sheets", 4, 1),
            ],
            101,
          ],
        ],
      }),
    )

    const element = totals.get(7)
    expect(element?.defcon).toEqual({ points: 2, count: 12 })
    expect(element?.saves).toEqual({ points: 2, count: 6 })
    expect(element?.cleanSheets).toEqual({ points: 4, count: 1 })
  })

  it("ignores zero-point entries so a forward's clean sheet doesn't pad the count", () => {
    const totals = buildElementCategoryTotals(
      live({
        "9": [
          [
            [
              explainStat("clean_sheets", 0, 1),
              explainStat("saves", 0, 2),
              explainStat("defensive_contribution", 0, 8),
            ],
            101,
          ],
        ],
      }),
    )

    expect(totals.size).toBe(0)
  })

  it("skips elements with nothing in the reported categories", () => {
    const totals = buildElementCategoryTotals(
      live({
        "10": [[[explainStat("minutes", 2, 90), explainStat("yellow_cards", -1, 1)], 101]],
        "11": [],
      }),
    )

    expect(totals.size).toBe(0)
  })
})

describe("sumPickCategories", () => {
  it("sums the categories of the counted players only", () => {
    const elementTotals = buildElementCategoryTotals(
      live({
        "1": [[[explainStat("goals_scored", 4, 1)], 101]],
        "2": [[[explainStat("goals_scored", 8, 2)], 101]],
        "3": [[[explainStat("goals_scored", 12, 3)], 101]],
      }),
    )

    const totals = sumPickCategories([1, 2], elementTotals)

    expect(totals.goals).toEqual({ points: 12, count: 3 })
  })

  it("ignores counted players who did not feature", () => {
    const totals = sumPickCategories([99], new Map())

    expect(totals).toEqual(emptyCategoryTotals())
  })
})

describe("addCategoryTotals", () => {
  it("accumulates every category", () => {
    const target = emptyCategoryTotals()
    const source = emptyCategoryTotals()
    source.goals = { points: 4, count: 1 }
    source.bonus = { points: 2, count: 2 }

    addCategoryTotals(target, source)
    addCategoryTotals(target, source)

    expect(target.goals).toEqual({ points: 8, count: 2 })
    expect(target.bonus).toEqual({ points: 4, count: 4 })
  })
})
