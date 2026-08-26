import { computePaceRows } from "@pbd/lib/fpl/pace"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, points: number[]) => ({
  entryApiId,
  rows: points.map((p) => ({ points: p })),
})

describe("computePaceRows", () => {
  it("projects the season from points per gameweek so far", () => {
    const rows = computePaceRows([entry(1, [50, 60])], 38)

    const row = rows.find((r) => r.entryApiId === 1)
    expect(row?.ppg).toBe(55)
    expect(row?.projectedTotal).toBe(2090)
  })

  it("measures the gap against the fastest projected manager", () => {
    const rows = computePaceRows([entry(1, [60]), entry(2, [40])], 10)

    expect(rows.find((r) => r.entryApiId === 1)?.gapToTopPace).toBe(0)
    expect(rows.find((r) => r.entryApiId === 2)?.gapToTopPace).toBe(200)
  })

  it("rounds a projection to a whole number of points", () => {
    const rows = computePaceRows([entry(1, [50, 51])], 38)

    expect(rows.find((r) => r.entryApiId === 1)?.projectedTotal).toBe(1919)
  })

  it("keeps a manager with no finished weeks on zero rather than dividing by zero", () => {
    const rows = computePaceRows([entry(1, []), entry(2, [40])], 38)

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ ppg: 0, projectedTotal: 0 })
  })

  it("carries the season total through untouched", () => {
    expect(computePaceRows([entry(1, [10, 20, 30])], 38)[0]?.totalPoints).toBe(60)
  })
})
