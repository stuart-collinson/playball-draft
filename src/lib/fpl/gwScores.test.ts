import { buildGwScores, tallyGwExtremes } from "@pbd/lib/fpl/gwScores"
import type { GwScore } from "@pbd/lib/fpl/gwScores"
import type { EntryHistoryResponse } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const score = (apiId: number, event: number, points: number, leagueId = 1): GwScore => ({
  apiId,
  event,
  points,
  leagueId,
})

const history = (events: [number, number][]): EntryHistoryResponse =>
  ({
    history: events.map(([event, points]) => ({ event, points, total_points: 0 })),
  }) as EntryHistoryResponse

describe("buildGwScores", () => {
  it("keeps only finished gameweeks, tagged with the entry's league", () => {
    const entries = [{ id: 10, leagueId: 1 }]
    const histories = [
      history([
        [1, 50],
        [2, 60],
      ]),
    ]

    const scores = buildGwScores(entries, histories, new Set([1]))

    expect(scores).toEqual([{ apiId: 10, event: 1, points: 50, leagueId: 1 }])
  })

  it("tolerates a missing history for an entry", () => {
    const entries = [
      { id: 10, leagueId: 1 },
      { id: 20, leagueId: 1 },
    ]

    const scores = buildGwScores(entries, [undefined, history([[1, 40]])], new Set([1]))

    expect(scores).toEqual([{ apiId: 20, event: 1, points: 40, leagueId: 1 }])
  })
})

describe("tallyGwExtremes", () => {
  it("awards a win to the top scorer and a loss to the bottom scorer per gameweek", () => {
    const { wins, lasts } = tallyGwExtremes([
      score(1, 1, 70),
      score(2, 1, 40),
      score(1, 2, 30),
      score(2, 2, 55),
    ])

    expect(wins.get(1)).toBe(1)
    expect(wins.get(2)).toBe(1)
    expect(lasts.get(1)).toBe(1)
    expect(lasts.get(2)).toBe(1)
  })

  it("shares a tied gameweek win between everyone on the top score", () => {
    const { wins } = tallyGwExtremes([score(1, 1, 60), score(2, 1, 60), score(3, 1, 20)])

    expect(wins.get(1)).toBe(1)
    expect(wins.get(2)).toBe(1)
    expect(wins.get(3)).toBeUndefined()
  })

  it("decides winners within each league, not across leagues", () => {
    const { wins } = tallyGwExtremes([
      score(1, 1, 40, 1),
      score(2, 1, 30, 1),
      // Lower score than league 1's winner, but tops its own league.
      score(3, 1, 35, 2),
      score(4, 1, 20, 2),
    ])

    expect(wins.get(1)).toBe(1)
    expect(wins.get(3)).toBe(1)
  })

  it("returns empty tallies for no scores", () => {
    const { wins, lasts } = tallyGwExtremes([])

    expect(wins.size).toBe(0)
    expect(lasts.size).toBe(0)
  })
})
