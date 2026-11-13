import { findTiedGameweeks, resolveGameweekVerdicts } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type { GameweekScore, GameweekTiebreakers } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type { GameweekReturns } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const score = (
  entryApiId: number,
  event: number,
  points: number,
  leagueId = 10,
  leaguePoints = 400,
): GameweekScore => ({
  entryApiId,
  leagueId,
  event,
  points,
  leaguePoints,
})

const scored = (overrides: Partial<GameweekReturns> = {}): GameweekReturns => ({
  goals: 0,
  assists: 0,
  cleanSheets: 0,
  goalsConceded: 0,
  ...overrides,
})

const NO_TIEBREAKERS: GameweekTiebreakers = {
  returnsFor: () => scored(),
  tablePositionFor: () => null,
}

const tiebreakersFrom = (
  returns: Map<number, GameweekReturns>,
  tablePositions: Map<number, number> = new Map(),
): GameweekTiebreakers => ({
  returnsFor: (entryApiId) => returns.get(entryApiId) ?? scored(),
  tablePositionFor: (entryApiId) => tablePositions.get(entryApiId) ?? null,
})

describe("resolveGameweekVerdicts", () => {
  it("names one winner and one loser per league per gameweek", () => {
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60), score(2, 1, 50), score(3, 1, 40)],
      NO_TIEBREAKERS,
    )

    expect(verdicts).toEqual([
      {
        leagueId: 10,
        event: 1,
        winnerApiId: 1,
        loserApiId: 3,
        coinTossApiIds: [],
        playerApiIds: [1, 2, 3],
      },
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
    const returns = new Map([
      [1, scored({ goals: 3 })],
      [2, scored({ goals: 1 })],
      [3, scored({ goals: 0, cleanSheets: 4 })],
      [4, scored({ goals: 2 })],
    ])
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60), score(2, 1, 60), score(3, 1, 40), score(4, 1, 40)],
      tiebreakersFrom(returns),
    )

    expect(verdicts[0]).toMatchObject({ winnerApiId: 1, loserApiId: 3 })
  })

  it("names the manager who conceded more as loser when points, goals and clean sheets are level", () => {
    const stu = 19443
    const rory = 19441
    const returns = new Map([
      [stu, scored({ goals: 1, cleanSheets: 1, goalsConceded: 13 })],
      [rory, scored({ goals: 1, cleanSheets: 1, goalsConceded: 15 })],
    ])
    const tablePositions = new Map([
      [stu, 5],
      [rory, 6],
    ])

    const verdicts = resolveGameweekVerdicts(
      [score(rory, 10, 37, 10, 438), score(stu, 10, 37, 10, 438), score(1, 10, 57, 10, 492)],
      tiebreakersFrom(returns, tablePositions),
    )

    expect(verdicts[0]).toMatchObject({ loserApiId: rory, coinTossApiIds: [] })
  })

  it("puts the manager lower on league points last when every gameweek stat is level", () => {
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 40, 10, 380), score(2, 1, 40, 10, 410)],
      NO_TIEBREAKERS,
    )

    expect(verdicts[0]).toMatchObject({ winnerApiId: 2, loserApiId: 1, coinTossApiIds: [] })
  })

  it("flags a coin toss but still names fpl's lower-listed manager when league points are level too", () => {
    const tablePositions = new Map([
      [1, 5],
      [2, 6],
    ])
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 40), score(2, 1, 40)],
      tiebreakersFrom(new Map(), tablePositions),
    )

    expect(verdicts[0]).toMatchObject({ winnerApiId: 1, loserApiId: 2, coinTossApiIds: [1, 2] })
  })

  it("lists everyone level with the loser when more than two need the coin toss", () => {
    const tablePositions = new Map([
      [1, 5],
      [2, 6],
      [3, 7],
    ])
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 40), score(2, 1, 40), score(3, 1, 40)],
      tiebreakersFrom(new Map(), tablePositions),
    )

    expect(verdicts[0]).toMatchObject({ loserApiId: 3, coinTossApiIds: [1, 2, 3] })
  })

  it("only flags a coin toss for a dead heat at the bottom, not at the top", () => {
    const verdicts = resolveGameweekVerdicts(
      [score(1, 1, 60), score(2, 1, 60), score(3, 1, 40)],
      NO_TIEBREAKERS,
    )

    expect(verdicts[0]).toMatchObject({ loserApiId: 3, coinTossApiIds: [] })
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
