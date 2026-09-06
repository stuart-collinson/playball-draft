import { computeGameweekCounts } from "@pbd/lib/fpl/gameweekCounts"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweekVerdicts"
import { describe, expect, it } from "vitest"

const verdict = (
  event: number,
  winnerApiId: number,
  loserApiId: number,
  playerApiIds: number[],
): GameweekVerdict => ({ leagueId: 10, event, winnerApiId, loserApiId, playerApiIds })

describe("computeGameweekCounts", () => {
  it("credits the week's winner with a win and the loser with a loss", () => {
    const counts = computeGameweekCounts([verdict(1, 1, 3, [1, 2, 3])])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 0 })
    expect(counts.find((c) => c.entryApiId === 3)).toMatchObject({ gwWins: 0, gwLosses: 1 })
  })

  it("gives the middle of the pack neither a win nor a loss", () => {
    const counts = computeGameweekCounts([verdict(1, 1, 3, [1, 2, 3])])

    expect(counts.find((c) => c.entryApiId === 2)).toMatchObject({ gwWins: 0, gwLosses: 0 })
  })

  it("counts a lone manager as both the best and the worst of that week", () => {
    const counts = computeGameweekCounts([verdict(1, 1, 1, [1])])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 1 })
  })

  it("adds up across several gameweeks", () => {
    const counts = computeGameweekCounts([verdict(1, 1, 2, [1, 2]), verdict(2, 2, 1, [1, 2])])

    expect(counts.find((c) => c.entryApiId === 1)).toMatchObject({ gwWins: 1, gwLosses: 1 })
    expect(counts.find((c) => c.entryApiId === 2)).toMatchObject({ gwWins: 1, gwLosses: 1 })
  })

  it("returns nothing when no gameweeks have been played", () => {
    expect(computeGameweekCounts([])).toEqual([])
  })
})
