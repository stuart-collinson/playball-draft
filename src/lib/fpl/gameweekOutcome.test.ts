import { hasNoScoresYet, resolveLeagueOutcome } from "@pbd/lib/fpl/gameweekOutcome"
import type { LeagueDetailsResponse, LeagueEntry, Standing } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const TEECE_API_ID = 19447
const PETE_API_ID = 19452
const UNKNOWN_API_ID = 999

const standing = (overrides: Partial<Standing> & Pick<Standing, "league_entry">): Standing => ({
  event_total: 0,
  last_rank: 1,
  rank: 1,
  rank_sort: 1,
  total: 0,
  ...overrides,
})

const entry = (id: number, firstName: string, lastName: string): LeagueEntry => ({
  entry_id: id,
  entry_name: `${firstName}'s XI`,
  id,
  joined_time: "",
  player_first_name: firstName,
  player_last_name: lastName,
  short_name: firstName.slice(0, 3).toUpperCase(),
  waiver_pick: 1,
})

const details = (standings: Standing[], entries: LeagueEntry[] = []): LeagueDetailsResponse =>
  ({ league: {}, league_entries: entries, standings }) as unknown as LeagueDetailsResponse

describe("resolveLeagueOutcome", () => {
  it("picks the highest gameweek score as winner and the lowest as loser", () => {
    const data = details([
      standing({ league_entry: TEECE_API_ID, event_total: 40, total: 300 }),
      standing({ league_entry: PETE_API_ID, event_total: 71, total: 280 }),
    ])

    const outcome = resolveLeagueOutcome(data, {}, {}, false)

    expect(outcome.winner?.name).toBe("Pete")
    expect(outcome.winner?.points).toBe(71)
    expect(outcome.loser?.name).toBe("Teece")
    expect(outcome.loser?.points).toBe(40)
  })

  it("falls back to live points while the official event total is still zero", () => {
    const data = details([
      standing({ league_entry: TEECE_API_ID }),
      standing({ league_entry: PETE_API_ID }),
    ])

    const outcome = resolveLeagueOutcome(data, {}, { [TEECE_API_ID]: 12, [PETE_API_ID]: 30 }, false)

    expect(outcome.winner?.name).toBe("Pete")
    expect(outcome.winner?.points).toBe(30)
    expect(outcome.loser?.points).toBe(12)
  })

  it("breaks a points tie on goals scored", () => {
    const data = details([
      standing({ league_entry: TEECE_API_ID, event_total: 50 }),
      standing({ league_entry: PETE_API_ID, event_total: 50 }),
    ])

    const outcome = resolveLeagueOutcome(data, { [TEECE_API_ID]: 1, [PETE_API_ID]: 4 }, {}, false)

    expect(outcome.winner?.name).toBe("Pete")
    expect(outcome.loser?.name).toBe("Teece")
  })

  it("uses season totals once the season is over", () => {
    const data = details([
      standing({ league_entry: TEECE_API_ID, event_total: 90, total: 1500 }),
      standing({ league_entry: PETE_API_ID, event_total: 10, total: 1800 }),
    ])

    const outcome = resolveLeagueOutcome(data, {}, {}, true)

    expect(outcome.winner?.name).toBe("Pete")
    expect(outcome.winner?.points).toBe(1800)
    expect(outcome.loser?.name).toBe("Teece")
    expect(outcome.loser?.points).toBe(1500)
  })

  it("sums the season total across every standing", () => {
    const data = details([
      standing({ league_entry: TEECE_API_ID, total: 300 }),
      standing({ league_entry: PETE_API_ID, total: 474 }),
    ])

    const outcome = resolveLeagueOutcome(data, {}, {}, false)

    expect(outcome.total).toBe(774)
  })

  it("returns no winner or loser and a zero total for an empty league", () => {
    const outcome = resolveLeagueOutcome(details([]), {}, {}, false)

    expect(outcome).toEqual({ winner: null, loser: null, total: 0 })
  })

  it("resolves the participant slug and image, falling back to entry names for strangers", () => {
    const data = details(
      [
        standing({ league_entry: TEECE_API_ID, event_total: 20 }),
        standing({ league_entry: UNKNOWN_API_ID, event_total: 60 }),
      ],
      [entry(UNKNOWN_API_ID, "Sam", "Stranger")],
    )

    const outcome = resolveLeagueOutcome(data, {}, {}, false)

    expect(outcome.loser).toEqual({
      apiId: TEECE_API_ID,
      slug: "thomas-campbell",
      name: "Teece",
      points: 20,
      image: "/participants/thomas_campbell.jpg",
    })
    expect(outcome.winner).toEqual({
      apiId: UNKNOWN_API_ID,
      slug: "sam-stranger",
      name: "Sam Stranger",
      points: 60,
      image: null,
    })
  })
})

describe("hasNoScoresYet", () => {
  it("is true when every standing has zero gameweek and live points", () => {
    const standings = [
      standing({ league_entry: TEECE_API_ID }),
      standing({ league_entry: PETE_API_ID }),
    ]

    expect(hasNoScoresYet(standings, {}, false)).toBe(true)
  })

  it("is false as soon as any live points land", () => {
    const standings = [
      standing({ league_entry: TEECE_API_ID }),
      standing({ league_entry: PETE_API_ID }),
    ]

    expect(hasNoScoresYet(standings, { [PETE_API_ID]: 2 }, false)).toBe(false)
  })

  it("is false once the season is over even with a quiet final gameweek", () => {
    const standings = [standing({ league_entry: TEECE_API_ID })]

    expect(hasNoScoresYet(standings, {}, true)).toBe(false)
  })
})
