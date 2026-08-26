import { computeStreaks } from "@pbd/lib/fpl/streaks"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, points: number[]) => ({
  entryApiId,
  leagueId,
  rows: points.map((p, i) => ({ event: i + 1, points: p })),
})

describe("computeStreaks", () => {
  it("tracks a current hot streak of consecutive above-median weeks", () => {
    const rows = computeStreaks([
      entry(1, 10, [10, 60, 60]),
      entry(2, 10, [50, 50, 50]),
      entry(3, 10, [60, 40, 40]),
      entry(4, 10, [70, 10, 10]),
    ])

    expect(rows.find((r) => r.entryApiId === 1)?.current).toEqual({ type: "hot", length: 2 })
  })

  it("breaks a streak on a week exactly at the median", () => {
    const rows = computeStreaks([entry(1, 10, [60, 50, 60]), entry(2, 10, [40, 50, 40])])

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first?.current).toEqual({ type: "hot", length: 1 })
    expect(first?.longestHot).toBe(1)
  })

  it("records the longest hot and cold runs across the season", () => {
    const rows = computeStreaks([
      entry(1, 10, [60, 60, 10, 10, 10, 60]),
      entry(2, 10, [40, 40, 50, 50, 50, 40]),
    ])

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first?.longestHot).toBe(2)
    expect(first?.longestCold).toBe(3)
  })

  it("returns none for an entry with no events", () => {
    const rows = computeStreaks([entry(1, 10, [])])

    expect(rows.find((r) => r.entryApiId === 1)?.current).toEqual({ type: "none", length: 0 })
  })
})
