import { awardedFromExplain, isBenchPosition, summariseSquadWeek } from "@pbd/lib/fpl/squadWeek"
import type { SquadWeekElement } from "@pbd/lib/fpl/squadWeek"
import type { EventLiveExplainEntry } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const stat = (name: string, points: number, value: number) => ({ name, points, value, stat: name })

const fixture = (
  items: { name: string; points: number; value: number }[],
): EventLiveExplainEntry => [items.map((item) => ({ ...item, stat: item.name })), 1]

const element = (
  overrides: Partial<SquadWeekElement["stats"]> = {},
  explain?: EventLiveExplainEntry[],
): SquadWeekElement => ({
  stats: {
    total_points: 0,
    goals_scored: 0,
    assists: 0,
    expected_goals: 0,
    expected_assists: 0,
    ...overrides,
  },
  explain,
})

describe("isBenchPosition", () => {
  it("treats positions twelve and above as bench", () => {
    expect([11, 12, 15].map(isBenchPosition)).toEqual([false, true, true])
  })
})

describe("awardedFromExplain", () => {
  it("sums clean sheets from the awarded value", () => {
    const result = awardedFromExplain([fixture([stat("clean_sheets", 4, 1)])])

    expect(result.cleanSheets).toBe(1)
  })

  it("sums defensive contribution from points, never from the action count", () => {
    const result = awardedFromExplain([fixture([stat("defensive_contribution", 2, 13)])])

    expect(result.defconPoints).toBe(2)
  })

  it("ignores stats that are not clean sheets or defensive contribution", () => {
    const result = awardedFromExplain([
      fixture([stat("minutes", 2, 90), stat("goals_scored", 6, 1), stat("bonus", 3, 3)]),
    ])

    expect(result).toEqual({ cleanSheets: 0, defconPoints: 0 })
  })

  it("adds up both fixtures of a double gameweek", () => {
    const result = awardedFromExplain([
      fixture([stat("clean_sheets", 4, 1), stat("defensive_contribution", 2, 10)]),
      fixture([stat("clean_sheets", 4, 1), stat("defensive_contribution", 2, 12)]),
    ])

    expect(result).toEqual({ cleanSheets: 2, defconPoints: 4 })
  })

  it("returns zeroes when a player has no explain data", () => {
    expect(awardedFromExplain(undefined)).toEqual({ cleanSheets: 0, defconPoints: 0 })
  })
})

describe("summariseSquadWeek", () => {
  const squad = new Map<number, SquadWeekElement>([
    [
      1,
      element(
        {
          total_points: 9,
          goals_scored: 1,
          assists: 1,
          expected_goals: 0.4,
          expected_assists: 0.2,
        },
        [fixture([stat("clean_sheets", 4, 1), stat("defensive_contribution", 2, 11)])],
      ),
    ],
    [
      2,
      element({
        total_points: 2,
        goals_scored: 0,
        assists: 0,
        expected_goals: 0.1,
        expected_assists: 0.3,
      }),
    ],
    [
      3,
      element(
        {
          total_points: 8,
          goals_scored: 2,
          assists: 1,
          expected_goals: 1.5,
          expected_assists: 0.9,
        },
        [fixture([stat("clean_sheets", 4, 1)])],
      ),
    ],
  ])
  const lookup = (id: number) => squad.get(id)

  it("counts goals, assists, clean sheets, defcon and expected numbers for starters only", () => {
    const week = summariseSquadWeek(
      4,
      [
        { element: 1, position: 1 },
        { element: 2, position: 11 },
      ],
      lookup,
    )

    expect(week).toEqual({
      event: 4,
      benchPoints: 0,
      starterGoals: 1,
      starterAssists: 1,
      starterCleanSheets: 1,
      starterDefconPoints: 2,
      starterExpectedGoals: 0.5,
      starterExpectedAssists: 0.5,
    })
  })

  it("gives a bench player's points to the bench and none of his returns to the starters", () => {
    const week = summariseSquadWeek(1, [{ element: 3, position: 12 }], lookup)

    expect(week.benchPoints).toBe(8)
    expect(week.starterGoals).toBe(0)
    expect(week.starterAssists).toBe(0)
    expect(week.starterCleanSheets).toBe(0)
  })

  it("counts a substitute who was moved into the eleven, because the picks are post autosub", () => {
    const benched = summariseSquadWeek(1, [{ element: 3, position: 13 }], lookup)
    const subbedOn = summariseSquadWeek(1, [{ element: 3, position: 10 }], lookup)

    expect(benched.starterGoals).toBe(0)
    expect(subbedOn.starterGoals).toBe(2)
    expect(subbedOn.benchPoints).toBe(0)
  })

  it("skips picks with no live data rather than counting them as zero-point starters", () => {
    const week = summariseSquadWeek(1, [{ element: 99, position: 1 }], lookup)

    expect(week.starterGoals).toBe(0)
    expect(week.benchPoints).toBe(0)
  })

  it("returns an empty week when a manager has no picks", () => {
    expect(summariseSquadWeek(7, [], lookup)).toMatchObject({ event: 7, benchPoints: 0 })
  })
})
