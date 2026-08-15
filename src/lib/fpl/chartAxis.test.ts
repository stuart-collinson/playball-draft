import {
  buildGameweekTicks,
  getGameweekAxisMax,
  getTickStep,
  shouldShowDots,
} from "@pbd/lib/fpl/chartAxis"
import { describe, expect, it } from "vitest"

const FULL_SEASON = 38

describe("getGameweekAxisMax", () => {
  it("tracks the latest gameweek played once past the minimum span", () => {
    expect(getGameweekAxisMax(20)).toBe(20)
    expect(getGameweekAxisMax(FULL_SEASON)).toBe(FULL_SEASON)
  })

  it("holds a minimum span so the first gameweeks are not stretched flat", () => {
    expect(getGameweekAxisMax(1)).toBe(6)
    expect(getGameweekAxisMax(3)).toBe(6)
  })
})

describe("getTickStep", () => {
  it("labels every gameweek while they still fit", () => {
    expect(getTickStep(6)).toBe(1)
    expect(getTickStep(13)).toBe(1)
  })

  it("widens the step as the season fills in", () => {
    expect(getTickStep(14)).toBe(2)
    expect(getTickStep(26)).toBe(2)
    expect(getTickStep(27)).toBe(3)
    expect(getTickStep(FULL_SEASON)).toBe(3)
  })
})

describe("buildGameweekTicks", () => {
  it("reproduces the full-season axis the chart has always ended on", () => {
    expect(buildGameweekTicks(FULL_SEASON)).toEqual([
      1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 38,
    ])
  })

  it("labels every gameweek early in the season", () => {
    expect(buildGameweekTicks(5)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it("always labels the most recent gameweek", () => {
    for (const latest of [7, 14, 21, 27, 33, FULL_SEASON]) {
      expect(buildGameweekTicks(latest)).toContain(latest)
    }
  })

  it("never exceeds the label budget at any point in a season", () => {
    for (let latest = 1; latest <= FULL_SEASON; latest++) {
      expect(buildGameweekTicks(latest).length).toBeLessThanOrEqual(13)
    }
  })

  it("only ever produces ascending ticks inside the axis", () => {
    for (let latest = 1; latest <= FULL_SEASON; latest++) {
      const ticks = buildGameweekTicks(latest)
      const axisMax = getGameweekAxisMax(latest)

      expect(ticks[0]).toBe(1)
      expect(ticks[ticks.length - 1]).toBe(axisMax)
      expect([...ticks].sort((a, b) => a - b)).toEqual(ticks)
      expect(new Set(ticks).size).toBe(ticks.length)
    }
  })

  it("drops the penultimate tick when it would collide with the last", () => {
    expect(buildGameweekTicks(FULL_SEASON)).not.toContain(37)
  })
})

describe("shouldShowDots", () => {
  it("marks the points while the chart is sparse", () => {
    expect(shouldShowDots(1)).toBe(true)
    expect(shouldShowDots(10)).toBe(true)
  })

  it("drops them once the season fills in and they become noise", () => {
    expect(shouldShowDots(11)).toBe(false)
    expect(shouldShowDots(FULL_SEASON)).toBe(false)
  })

  it("shows nothing when no gameweeks have been played", () => {
    expect(shouldShowDots(0)).toBe(false)
  })
})
