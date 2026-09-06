import { compareGameweekResults, rankGameweekResults } from "@pbd/lib/fpl/gameweekResult"
import type { GameweekResult } from "@pbd/lib/fpl/gameweekResult"
import { describe, expect, it } from "vitest"

const result = (overrides: Partial<GameweekResult>): GameweekResult => ({
  points: 50,
  goals: 2,
  tableRank: 1,
  ...overrides,
})

describe("compareGameweekResults", () => {
  it("ranks the higher gameweek score first", () => {
    const ranked = [result({ points: 40 }), result({ points: 71 })].sort(compareGameweekResults)

    expect(ranked.map((entry) => entry.points)).toEqual([71, 40])
  })

  it("breaks a points tie on goals scored", () => {
    const ranked = [result({ goals: 1 }), result({ goals: 4 })].sort(compareGameweekResults)

    expect(ranked.map((entry) => entry.goals)).toEqual([4, 1])
  })

  it("breaks a points and goals tie on league table position", () => {
    const ranked = [result({ tableRank: 6 }), result({ tableRank: 3 })].sort(compareGameweekResults)

    expect(ranked.map((entry) => entry.tableRank)).toEqual([3, 6])
  })

  it("treats identical results as equal", () => {
    expect(compareGameweekResults(result({}), result({}))).toBe(0)
  })
})

describe("rankGameweekResults", () => {
  it("puts the winner first and the loser last without touching the input", () => {
    const input = [result({ points: 40 }), result({ points: 71 }), result({ points: 55 })]

    const ranked = rankGameweekResults(input)

    expect(ranked.map((entry) => entry.points)).toEqual([71, 55, 40])
    expect(input.map((entry) => entry.points)).toEqual([40, 71, 55])
  })
})
