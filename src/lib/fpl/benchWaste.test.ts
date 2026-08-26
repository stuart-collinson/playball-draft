import { computeBenchWaste } from "@pbd/lib/fpl/benchWaste"
import { describe, expect, it } from "vitest"

describe("computeBenchWaste", () => {
  const weeks = [
    { event: 1, benchPoints: 4 },
    { event: 2, benchPoints: 12 },
    { event: 3, benchPoints: 2 },
  ]

  it("totals the points left on the bench", () => {
    expect(computeBenchWaste(weeks, 150, 3).benchTotal).toBe(18)
  })

  it("averages the waste over the gameweeks played", () => {
    expect(computeBenchWaste(weeks, 150, 3).benchAvg).toBe(6)
  })

  it("finds the most painful single week", () => {
    const result = computeBenchWaste(weeks, 150, 3)

    expect(result.worstEvent).toBe(2)
    expect(result.worstPoints).toBe(12)
  })

  it("reports efficiency as the starting share of the whole squad's points", () => {
    expect(computeBenchWaste([{ event: 1, benchPoints: 20 }], 80, 1).efficiencyPct).toBe(80)
  })

  it("reports full efficiency when nobody has scored at all", () => {
    expect(computeBenchWaste([], 0, 0).efficiencyPct).toBe(100)
  })

  it("reports no worst week when the bench has never scored", () => {
    const result = computeBenchWaste([{ event: 1, benchPoints: 0 }], 60, 1)

    expect(result).toMatchObject({
      benchTotal: 0,
      worstEvent: 0,
      worstPoints: 0,
      efficiencyPct: 100,
    })
  })

  it("avoids dividing by zero before a gameweek is played", () => {
    expect(computeBenchWaste([], 0, 0).benchAvg).toBe(0)
  })
})
