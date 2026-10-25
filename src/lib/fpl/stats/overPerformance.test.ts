import { computeOverPerformance } from "@pbd/lib/fpl/stats/overPerformance"
import { describe, expect, it } from "vitest"

const returns = (
  goals: number,
  assists: number,
  expectedGoals: number,
  expectedAssists: number,
) => ({
  goals,
  assists,
  expectedGoals,
  expectedAssists,
})

describe("computeOverPerformance", () => {
  it("adds goals and assists together, and expected goals and assists together", () => {
    const result = computeOverPerformance(returns(15, 10, 18, 12))

    expect(result.involvements).toBe(25)
    expect(result.expectedInvolvements).toBe(30)
  })

  it("reports a minus difference when a squad scores and assists less than expected", () => {
    const result = computeOverPerformance(returns(15, 10, 18, 12))

    expect(result.difference).toBe(-5)
    expect(result.differencePct).toBe(-17)
  })

  it("reports a plus difference when a squad scores and assists more than expected", () => {
    const result = computeOverPerformance(returns(20, 10, 6, 4))

    expect(result.difference).toBe(20)
    expect(result.differencePct).toBe(200)
  })

  it("rounds the expected total and difference to one decimal place", () => {
    const result = computeOverPerformance(returns(2, 1, 1.1, 0.2))

    expect(result.expectedInvolvements).toBe(1.3)
    expect(result.difference).toBe(1.7)
  })

  it("reports no percentage when the squad has no expected goals or assists yet", () => {
    const result = computeOverPerformance(returns(1, 0, 0, 0))

    expect(result.difference).toBe(1)
    expect(result.differencePct).toBeNull()
  })
})
