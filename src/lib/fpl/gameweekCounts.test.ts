import { computeGameweekCounts } from "@pbd/lib/fpl/gameweekCounts"
import { describe, expect, it } from "vitest"

const score = (entryApiId: number, event: number, points: number, leagueId = 10) => ({
  entryApiId,
  leagueId,
  event,
  points,
})

describe("computeGameweekCounts", () => {
  it("credits the top scorer of a gameweek with a win and the bottom with a loss", () => {
    const counts = computeGameweekCounts([score(1, 1, 60), score(2, 1, 50), score(3, 1, 40)])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 0 })
    expect(counts.find((c) => c.entryApiId === 3)).toMatchObject({ gwWins: 0, gwLosses: 1 })
  })

  it("gives the middle of the pack neither a win nor a loss", () => {
    const counts = computeGameweekCounts([score(1, 1, 60), score(2, 1, 50), score(3, 1, 40)])

    expect(counts.find((c) => c.entryApiId === 2)).toMatchObject({ gwWins: 0, gwLosses: 0 })
  })

  it("shares a win between managers who tie at the top", () => {
    const counts = computeGameweekCounts([score(1, 1, 60), score(2, 1, 60), score(3, 1, 40)])

    expect(counts.find((c) => c.entryApiId === 1)?.gwWins).toBe(1)
    expect(counts.find((c) => c.entryApiId === 2)?.gwWins).toBe(1)
  })

  it("counts a lone manager as both the best and the worst of that week", () => {
    const counts = computeGameweekCounts([score(1, 1, 50)])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 1 })
  })

  it("adds up across several gameweeks", () => {
    const counts = computeGameweekCounts([
      score(1, 1, 60),
      score(2, 1, 40),
      score(1, 2, 30),
      score(2, 2, 70),
    ])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 1 })
  })

  it("never compares managers from different leagues", () => {
    const counts = computeGameweekCounts([score(1, 1, 60, 10), score(2, 1, 90, 20)])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 1 })
    expect(counts.find((c) => c.entryApiId === 2)).toMatchObject({ gwWins: 1, gwLosses: 1 })
  })

  it("returns nothing when no gameweeks have been played", () => {
    expect(computeGameweekCounts([])).toEqual([])
  })
})
