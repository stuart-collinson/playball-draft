import { findTiedGameweeks, resolveGameweekVerdicts } from "@pbd/lib/fpl/gameweekVerdicts"
import type { GameweekScore, GameweekTiebreakers } from "@pbd/lib/fpl/gameweekVerdicts"
import { describe, expect, it } from "vitest"

const score = (
  entryApiId: number,
  event: number,
  points: number,
  leagueId = 10,
): GameweekScore => ({
  entryApiId,
  leagueId,
  event,
  points,
})

const NO_TIEBREAKERS: GameweekTiebreakers = {
  goalsFor: () => 0,
  tableRankFor: () => null,
}

describe("resolveGameweekVerdicts", () => {
  it("names one winner and one loser per league per gameweek", () => {
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60), score(2, 1, 50), score(3, 1, 40)],
      NO_TIEBREAKERS,
    )

    expect(verdicts).toEqual([
      { leagueId: 10, event: 1, winnerApiId: 1, loserApiId: 3, playerApiIds: [1, 2, 3] },
    ])
  })

  it("never compares managers from different leagues", () => {
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60, 10), score(2, 1, 40, 10), score(3, 1, 90, 20)],
      NO_TIEBREAKERS,
    )

    expect(verdicts).toHaveLength(2)
    expect(verdicts.find((v) => v.leagueId === 20)).toMatchObject({ winnerApiId: 3, loserApiId: 3 })
  })

  it("breaks ties at the top and bottom on goals scored", () => {
    const goals = new Map([
      [1, 3],
      [2, 1],
      [3, 0],
      [4, 2],
    ])
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60), score(2, 1, 60), score(3, 1, 40), score(4, 1, 40)],
      { goalsFor: (entryApiId) => goals.get(entryApiId) ?? 0, tableRankFor: () => null },
    )

    expect(verdicts[0]).toMatchObject({ winnerApiId: 1, loserApiId: 3 })
  })

  it("falls back to league table position when points and goals are level", () => {
    const tableRanks = new Map([
      [1, 5],
      [2, 2],
    ])
    const verdicts = resolveGameweekVerdicts([score(1, 1, 40), score(2, 1, 40)], {
      goalsFor: () => 1,
      tableRankFor: (entryApiId) => tableRanks.get(entryApiId) ?? null,
    })

    expect(verdicts[0]).toMatchObject({ winnerApiId: 2, loserApiId: 1 })
  })

  it("keeps each gameweek separate", () => {
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60), score(2, 1, 40), score(1, 2, 30), score(2, 2, 70)],
      NO_TIEBREAKERS,
    )

    expect(verdicts.map((v) => [v.event, v.winnerApiId, v.loserApiId])).toEqual([
      [1, 1, 2],
      [2, 2, 1],
    ])
  })

  it("returns nothing when no gameweeks have been played", () => {
    expect(resolveGameweekVerdicts([], NO_TIEBREAKERS)).toEqual([])
  })
})

describe("findTiedGameweeks", () => {
  it("lists only the managers tied at the top or bottom of a gameweek", () => {
    const tied = findTiedGameweeks([
      score(1, 1, 60),
      score(2, 1, 60),
      score(3, 1, 50),
      score(4, 1, 40),
      score(5, 1, 40),
    ])

    expect(tied).toEqual([{ event: 1, entryApiIds: [1, 2, 4, 5] }])
  })

  it("merges ties from both leagues in the same gameweek", () => {
    const tied = findTiedGameweeks([
      score(1, 3, 60, 10),
      score(2, 3, 60, 10),
      score(3, 3, 50, 20),
      score(4, 3, 50, 20),
    ])

    expect(tied).toEqual([{ event: 3, entryApiIds: [1, 2, 3, 4] }])
  })

  it("ignores gameweeks with a clear winner and loser", () => {
    expect(findTiedGameweeks([score(1, 1, 60), score(2, 1, 40)])).toEqual([])
  })
})
