import { computeScoreDistribution } from "@pbd/lib/fpl/scoreDistribution"
import { describe, expect, it } from "vitest"

describe("computeScoreDistribution", () => {
  it("computes average and population standard deviation", () => {
    const result = computeScoreDistribution([40, 60])

    expect(result.average).toBe(50)
    expect(result.stdDev).toBe(10)
  })

  it("interpolates floor and ceiling percentiles", () => {
    const result = computeScoreDistribution([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])

    expect(result.floor).toBe(19)
    expect(result.ceiling).toBe(91)
  })

  it("counts gameweeks at or above each threshold", () => {
    const result = computeScoreDistribution([49, 50, 60, 70, 71])

    expect(result.over50).toBe(4)
    expect(result.over60).toBe(3)
    expect(result.over70).toBe(2)
  })

  it("returns a zeroed distribution for an empty season", () => {
    expect(computeScoreDistribution([])).toEqual({
      average: 0,
      stdDev: 0,
      floor: 0,
      ceiling: 0,
      over50: 0,
      over60: 0,
      over70: 0,
    })
  })

  it("handles a single gameweek without spread", () => {
    const result = computeScoreDistribution([64])

    expect(result).toMatchObject({ average: 64, stdDev: 0, floor: 64, ceiling: 64 })
  })
})
