import {
  compareGameweekResults,
  isCoinToss,
  rankGameweekResults,
} from "@pbd/lib/fpl/gameweek/gameweekResult"
import type { GameweekResult } from "@pbd/lib/fpl/gameweek/gameweekResult"
import { describe, expect, it } from "vitest"

const result = (overrides: Partial<GameweekResult>): GameweekResult => ({
  points: 50,
  goals: 2,
  cleanSheets: 1,
  goalsConceded: 10,
  leaguePoints: 400,
  tablePosition: 1,
  ...overrides,
})

const loserOf = (...results: GameweekResult[]): GameweekResult | undefined =>
  rankGameweekResults(results).at(-1)

describe("compareGameweekResults", () => {
  it("loses the gameweek on fewer points before any tie-breaker", () => {
    const lowScorer = result({ points: 40, goals: 9, cleanSheets: 5, goalsConceded: 0 })

    expect(loserOf(lowScorer, result({ points: 41 }))).toBe(lowScorer)
  })

  it("loses a points tie on fewer goals scored", () => {
    const fewerGoals = result({ goals: 1, cleanSheets: 5, goalsConceded: 0 })

    expect(loserOf(fewerGoals, result({ goals: 2 }))).toBe(fewerGoals)
  })

  it("loses a points and goals tie on fewer clean sheets", () => {
    const fewerCleanSheets = result({ cleanSheets: 0, goalsConceded: 0 })

    expect(loserOf(fewerCleanSheets, result({ cleanSheets: 1 }))).toBe(fewerCleanSheets)
  })

  it("loses a points, goals and clean sheet tie on more goals conceded", () => {
    const concededMore = result({ goalsConceded: 15, leaguePoints: 999 })

    expect(loserOf(concededMore, result({ goalsConceded: 13 }))).toBe(concededMore)
  })

  it("loses when level on every gameweek stat by being lower on league points", () => {
    const lowerInLeague = result({ leaguePoints: 399, tablePosition: 1 })

    expect(loserOf(lowerInLeague, result({ leaguePoints: 400, tablePosition: 8 }))).toBe(
      lowerInLeague,
    )
  })

  it("falls back to the fpl table order when league points are level too", () => {
    const listedLower = result({ tablePosition: 6 })

    expect(loserOf(listedLower, result({ tablePosition: 5 }))).toBe(listedLower)
  })

  it("puts rory below stu in gw10, when rory conceded 15 to stu's 13", () => {
    const stu = result({
      points: 37,
      goals: 1,
      cleanSheets: 1,
      goalsConceded: 13,
      tablePosition: 5,
    })
    const rory = result({
      points: 37,
      goals: 1,
      cleanSheets: 1,
      goalsConceded: 15,
      tablePosition: 6,
    })

    expect(loserOf(rory, stu)).toBe(rory)
  })

  it("ranks the winner on the same ladder, so more goals wins a points tie at the top", () => {
    const moreGoals = result({ points: 70, goals: 3 })

    expect(rankGameweekResults([result({ points: 70, goals: 1 }), moreGoals])[0]).toBe(moreGoals)
  })
})

describe("isCoinToss", () => {
  it("is a coin toss when only the fpl table order separates two managers", () => {
    expect(isCoinToss(result({ tablePosition: 5 }), result({ tablePosition: 6 }))).toBe(true)
  })

  it("is not a coin toss once any rule before the table order separates them", () => {
    expect(isCoinToss(result({ leaguePoints: 438 }), result({ leaguePoints: 437 }))).toBe(false)
    expect(isCoinToss(result({ goalsConceded: 13 }), result({ goalsConceded: 15 }))).toBe(false)
  })
})

describe("rankGameweekResults", () => {
  it("puts the winner first and the loser last without touching the input", () => {
    const input = [result({ points: 40 }), result({ points: 71 }), result({ points: 55 })]

    const ranked = rankGameweekResults(input)

    expect(ranked.map((entry) => entry.points)).toEqual([71, 55, 40])
    expect(input.map((entry) => entry.points)).toEqual([40, 71, 55])
  })

  it("treats identical results as equal", () => {
    expect(compareGameweekResults(result({}), result({}))).toBe(0)
  })
})
