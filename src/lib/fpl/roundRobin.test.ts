import {
  computePairwiseGrids,
  computeRivalExtremes,
  computeRoundRobinTable,
} from "@pbd/lib/fpl/roundRobin"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, points: number[]) => ({
  entryApiId,
  leagueId,
  rows: points.map((p, i) => ({ event: i + 1, points: p })),
})

describe("computeRoundRobinTable", () => {
  it("credits a win per opponent outscored each event", () => {
    const rows = computeRoundRobinTable([
      entry(1, 10, [60, 40]),
      entry(2, 10, [50, 50]),
      entry(3, 10, [40, 30]),
    ])

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first).toMatchObject({ wins: 3, draws: 0, losses: 1 })
  })

  it("scores identical points as a draw for both sides", () => {
    const rows = computeRoundRobinTable([entry(1, 10, [50]), entry(2, 10, [50])])

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, draws: 1, losses: 0 })
    expect(rows.find((r) => r.entryApiId === 2)).toMatchObject({ wins: 0, draws: 1, losses: 0 })
  })

  it("never compares entries across leagues", () => {
    const rows = computeRoundRobinTable([entry(1, 10, [60]), entry(2, 99, [10])])

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, draws: 0, losses: 0 })
  })

  it("reports positive luck when table rank beats round robin rank", () => {
    const rows = computeRoundRobinTable([
      entry(1, 10, [140, 10, 10]),
      entry(2, 10, [50, 50, 50]),
      entry(3, 10, [45, 45, 45]),
      entry(4, 10, [40, 40, 40]),
    ])

    const boomBust = rows.find((r) => r.entryApiId === 1)
    expect(boomBust?.actualRank).toBe(1)
    expect(boomBust?.roundRobinRank).toBe(3)
    expect(boomBust?.luckDelta).toBe(2)
  })

  it("computes winPct as wins plus half draws over games played", () => {
    const rows = computeRoundRobinTable([entry(1, 10, [50, 60]), entry(2, 10, [50, 40])])

    expect(rows.find((r) => r.entryApiId === 1)?.winPct).toBe(75)
  })

  it("returns zeroed records when no events are played", () => {
    const rows = computeRoundRobinTable([entry(1, 10, []), entry(2, 10, [])])

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, winPct: 0 })
  })
})

describe("computePairwiseGrids", () => {
  it("builds a per-league matrix aligned to a dominance-sorted order", () => {
    const grids = computePairwiseGrids([
      entry(1, 10, [60, 60]),
      entry(2, 10, [50, 50]),
      entry(3, 10, [40, 55]),
    ])

    const grid = grids.find((g) => g.leagueId === 10)
    expect(grid?.order[0]).toBe(1)
    const topRow = grid?.cells[0]
    expect(topRow?.[1]).toMatchObject({ wins: 2, losses: 0 })
    expect(topRow?.[0]).toMatchObject({ wins: 0, draws: 0, losses: 0 })
  })

  it("tracks the points margin between each pair", () => {
    const grids = computePairwiseGrids([entry(1, 10, [60, 40]), entry(2, 10, [50, 50])])

    const grid = grids.find((g) => g.leagueId === 10)
    if (!grid) throw new Error("missing grid")
    const oneIndex = grid.order.indexOf(1)
    const twoIndex = grid.order.indexOf(2)

    expect(grid.cells[oneIndex]?.[twoIndex]?.margin).toBe(0)
    expect(grid.cells[twoIndex]?.[oneIndex]?.margin).toBe(0)
  })
})

describe("computeRivalExtremes", () => {
  it("finds the nemesis with the worst net record against you", () => {
    const grids = computePairwiseGrids([
      entry(1, 10, [60, 10, 60]),
      entry(2, 10, [50, 50, 50]),
      entry(3, 10, [70, 5, 5]),
    ])
    const grid = grids.find((g) => g.leagueId === 10)
    if (!grid) throw new Error("missing grid")

    const extremes = computeRivalExtremes(grid)

    const forTwo = extremes.find((e) => e.entryApiId === 2)
    expect(forTwo?.nemesisApiId).toBe(1)
    expect(forTwo?.nemesisRecord).toEqual({ wins: 1, draws: 0, losses: 2, margin: 20 })
  })

  it("breaks a tied record by whoever outscored you by more", () => {
    const grids = computePairwiseGrids([
      entry(1, 10, [40, 40]),
      entry(2, 10, [41, 41]),
      entry(3, 10, [90, 90]),
    ])
    const grid = grids.find((g) => g.leagueId === 10)
    if (!grid) throw new Error("missing grid")

    const forOne = computeRivalExtremes(grid).find((e) => e.entryApiId === 1)

    expect(forOne?.nemesisApiId).toBe(3)
    expect(forOne?.nemesisRecord?.margin).toBe(-100)
  })
})
