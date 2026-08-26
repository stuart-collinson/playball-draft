import { sumSquadReturns } from "@pbd/lib/fpl/squadReturns"
import type { SquadWeekStats } from "@pbd/lib/fpl/squadWeek"
import { describe, expect, it } from "vitest"

const week = (overrides: Partial<SquadWeekStats>): SquadWeekStats => ({
  event: 1,
  benchPoints: 0,
  starterGoals: 0,
  starterAssists: 0,
  starterCleanSheets: 0,
  starterDefconPoints: 0,
  starterExpectedGoals: 0,
  starterExpectedAssists: 0,
  ...overrides,
})

describe("sumSquadReturns", () => {
  it("adds every return across the season", () => {
    const result = sumSquadReturns([
      week({ starterGoals: 2, starterAssists: 1, starterCleanSheets: 3, starterDefconPoints: 4 }),
      week({
        event: 2,
        starterGoals: 1,
        starterAssists: 2,
        starterCleanSheets: 1,
        starterDefconPoints: 2,
      }),
    ])

    expect(result).toMatchObject({ goals: 3, assists: 3, cleanSheets: 4, defconPoints: 6 })
  })

  it("rounds the expected numbers to one decimal place", () => {
    const result = sumSquadReturns([
      week({ starterExpectedGoals: 0.44, starterExpectedAssists: 0.4 }),
      week({ event: 2, starterExpectedGoals: 0.19, starterExpectedAssists: 0.3 }),
    ])

    expect(result.expectedGoals).toBe(0.6)
    expect(result.expectedAssists).toBe(0.7)
  })

  it("ignores bench points entirely", () => {
    const result = sumSquadReturns([week({ benchPoints: 40, starterGoals: 1 })])

    expect(result.goals).toBe(1)
  })

  it("returns zeroes for a manager with no finished weeks", () => {
    expect(sumSquadReturns([])).toEqual({
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      defconPoints: 0,
      expectedGoals: 0,
      expectedAssists: 0,
    })
  })
})
