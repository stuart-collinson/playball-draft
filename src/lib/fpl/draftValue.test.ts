import {
  computeDraftGrades,
  computeDraftValue,
  computeReachRows,
  computeRoundWinners,
} from "@pbd/lib/fpl/draftValue"
import { describe, expect, it } from "vitest"

const pick = (
  pickNumber: number,
  entryApiId: number,
  elementId: number,
  seasonPoints: number,
  draftRank: number,
  leagueId = 10,
) => ({
  leagueId,
  round: Math.ceil(pickNumber / 2),
  pickNumber,
  entryApiId,
  elementId,
  seasonPoints,
  draftRank,
})

describe("computeDraftGrades", () => {
  it("totals and averages each manager's draft class", () => {
    const grades = computeDraftGrades([
      pick(1, 1, 101, 100, 1),
      pick(2, 2, 102, 40, 2),
      pick(3, 2, 103, 60, 3),
      pick(4, 1, 104, 10, 4),
    ])

    expect(grades.find((g) => g.entryApiId === 1)).toMatchObject({
      totalPoints: 110,
      avgPoints: 55,
      bestPickElementId: 101,
    })
  })
})

describe("computeDraftValue", () => {
  it("scores late picks that outscore the board as steals", () => {
    const rows = computeDraftValue([
      pick(1, 1, 101, 20, 1),
      pick(2, 2, 102, 90, 2),
      pick(3, 1, 103, 50, 3),
    ])

    const steal = rows.find((r) => r.elementId === 102)
    expect(steal?.pointsRank).toBe(1)
    expect(steal?.valueScore).toBe(1)
    const bust = rows.find((r) => r.elementId === 101)
    expect(bust?.valueScore).toBe(-2)
  })

  it("ranks points within each league separately", () => {
    const rows = computeDraftValue([pick(1, 1, 101, 10, 1, 10), pick(1, 9, 201, 5, 1, 20)])

    expect(rows.find((r) => r.elementId === 201)?.pointsRank).toBe(1)
  })
})

describe("computeRoundWinners", () => {
  it("picks the highest scorer of each round per league", () => {
    const winners = computeRoundWinners([
      pick(1, 1, 101, 30, 1),
      pick(2, 2, 102, 80, 2),
      pick(3, 1, 103, 70, 3),
      pick(4, 2, 104, 20, 4),
    ])

    expect(winners.find((w) => w.round === 1)?.pick.elementId).toBe(102)
    expect(winners.find((w) => w.round === 2)?.pick.elementId).toBe(103)
  })
})

describe("computeReachRows", () => {
  it("marks players taken ahead of their official rank as reaches", () => {
    const rows = computeReachRows([pick(5, 1, 101, 0, 40), pick(100, 2, 102, 0, 20)])

    expect(rows.find((r) => r.elementId === 101)?.reachDelta).toBe(35)
    expect(rows.find((r) => r.elementId === 102)?.reachDelta).toBe(-80)
  })

  it("sorts the biggest reaches first", () => {
    const rows = computeReachRows([pick(50, 1, 101, 0, 10), pick(5, 2, 102, 0, 60)])

    expect(rows[0]?.elementId).toBe(102)
  })
})
