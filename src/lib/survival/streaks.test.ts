import { LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import {
  isFplSeason,
  pendingGameweeks,
  peopleWithMoreThanOneOutcome,
  peopleWithoutOutcomes,
  rankSurvivalStreaks,
  summariseSurvivalStreaks,
  survivalOutcomes,
} from "@pbd/lib/survival/streaks"
import type { SurvivalRecord, SurvivalStreak } from "@pbd/types/survival.types"
import { describe, expect, it } from "vitest"

const SEASON = "2026/27"
const LAST_SEASON = "2025/26"

const STU_API_ID = 19453
const RORY_API_ID = 19451
const TEECE_API_ID = 19447

const PERSON_BY_API_ID = new Map([
  [STU_API_ID, "stuart-collinson"],
  [RORY_API_ID, "rory-sproule"],
  [TEECE_API_ID, "thomas-campbell"],
])

const record = (overrides: Partial<SurvivalRecord> = {}): SurvivalRecord => ({
  person: "stuart-collinson",
  league: "premiership",
  weeksSinceLoss: 2,
  asOfSeason: SEASON,
  asOfGameweek: 9,
  ...overrides,
})

const verdict = (overrides: Partial<GameweekVerdict> = {}): GameweekVerdict => ({
  leagueId: LEAGUE_SLUG_TO_ID.premiership,
  event: 10,
  winnerApiId: TEECE_API_ID,
  loserApiId: RORY_API_ID,
  loserNeedsCoinToss: false,
  playerApiIds: [STU_API_ID, RORY_API_ID, TEECE_API_ID],
  ...overrides,
})

const outcomesOf = (gameweekVerdict: GameweekVerdict) =>
  survivalOutcomes(gameweekVerdict, (entryApiId) => PERSON_BY_API_ID.get(entryApiId))

describe("pendingGameweeks", () => {
  it("lists only the finished gameweeks the database has not recorded yet", () => {
    const records = [
      record({ asOfGameweek: 9 }),
      record({ person: "rory-sproule", asOfGameweek: 9 }),
    ]

    expect(pendingGameweeks(records, [8, 9, 10], SEASON)).toEqual([10])
  })

  it("has nothing to record when the database is already up to date", () => {
    expect(pendingGameweeks([record({ asOfGameweek: 10 })], [8, 9, 10], SEASON)).toEqual([])
  })

  it("catches up every missed gameweek in order, from the least recent record", () => {
    const records = [
      record({ asOfGameweek: 10 }),
      record({ person: "rory-sproule", asOfGameweek: 8 }),
    ]

    expect(pendingGameweeks(records, [11, 9, 10], SEASON)).toEqual([9, 10, 11])
  })

  it("starts a new season from gameweek one once last season was recorded to the final gameweek", () => {
    const records = [record({ asOfSeason: LAST_SEASON, asOfGameweek: 38 })]

    expect(pendingGameweeks(records, [1, 2], SEASON)).toEqual([1, 2])
  })

  it("leaves a previous season that stopped short of the final gameweek alone", () => {
    const records = [record({ asOfSeason: LAST_SEASON, asOfGameweek: 30 })]

    expect(pendingGameweeks(records, [1, 2], SEASON)).toEqual([])
  })

  it("has nothing to record without any records", () => {
    expect(pendingGameweeks([], [1, 2], SEASON)).toEqual([])
  })
})

describe("survivalOutcomes", () => {
  it("marks only the gameweek loser as having lost", () => {
    expect(outcomesOf(verdict())).toEqual([
      { person: "stuart-collinson", league: "premiership", lost: false },
      { person: "rory-sproule", league: "premiership", lost: true },
      { person: "thomas-campbell", league: "premiership", lost: false },
    ])
  })

  it("marks nobody as lost when the loser can only be settled by a coin toss", () => {
    const outcomes = outcomesOf(verdict({ loserNeedsCoinToss: true }))

    expect(outcomes.every((outcome) => !outcome.lost)).toBe(true)
    expect(outcomes).toHaveLength(3)
  })

  it("skips managers who cannot be matched to a person", () => {
    const outcomes = outcomesOf(verdict({ playerApiIds: [STU_API_ID, 999] }))

    expect(outcomes).toEqual([{ person: "stuart-collinson", league: "premiership", lost: false }])
  })

  it("files each outcome under the league the gameweek was played in", () => {
    const outcomes = outcomesOf(verdict({ leagueId: LEAGUE_SLUG_TO_ID.championship }))

    expect(outcomes.every((outcome) => outcome.league === "championship")).toBe(true)
  })

  it("gives no outcomes for a league the app does not know", () => {
    expect(outcomesOf(verdict({ leagueId: 10 }))).toEqual([])
  })
})

describe("peopleWithMoreThanOneOutcome", () => {
  it("is empty when every result belongs to a different person", () => {
    expect(peopleWithMoreThanOneOutcome(outcomesOf(verdict()))).toEqual([])
  })

  it("names a person who two managers both resolve to", () => {
    const outcomes = [
      ...outcomesOf(verdict()),
      { person: "rory-sproule", league: "championship" as const, lost: false },
    ]

    expect(peopleWithMoreThanOneOutcome(outcomes)).toEqual(["rory-sproule"])
  })
})

describe("peopleWithoutOutcomes", () => {
  it("is empty when every survival row due this gameweek has a result", () => {
    const records = [record(), record({ person: "rory-sproule" })]

    expect(peopleWithoutOutcomes(records, outcomesOf(verdict()), 10, SEASON)).toEqual([])
  })

  it("names every due survival row the gameweek's results do not cover", () => {
    const records = [
      record(),
      record({ person: "rory-sproule" }),
      record({ person: "luke-niblock", league: "championship" }),
    ]
    const outcomes = outcomesOf(verdict({ playerApiIds: [STU_API_ID] }))

    expect(peopleWithoutOutcomes(records, outcomes, 10, SEASON)).toEqual([
      "rory-sproule",
      "luke-niblock",
    ])
  })

  it("ignores rows that are not due this gameweek, so they cannot block the rest", () => {
    const records = [
      record(),
      record({ person: "luke-niblock", asOfGameweek: 10 }),
      record({ person: "alan-waring", asOfSeason: LAST_SEASON, asOfGameweek: 30 }),
    ]
    const outcomes = outcomesOf(verdict({ playerApiIds: [STU_API_ID] }))

    expect(peopleWithoutOutcomes(records, outcomes, 10, SEASON)).toEqual([])
  })

  it("treats a row finished at last season's final gameweek as due for the opening week", () => {
    const records = [record({ asOfSeason: LAST_SEASON, asOfGameweek: 38 })]

    expect(peopleWithoutOutcomes(records, [], 1, SEASON)).toEqual(["stuart-collinson"])
  })
})

describe("isFplSeason", () => {
  const opener = (deadlineTime: string) => [
    { id: 1, deadline_time: deadlineTime },
    { id: 2, deadline_time: "2026-08-28T17:30:00Z" },
  ]

  it("matches when the opening gameweek's deadline falls in the season's first year", () => {
    expect(isFplSeason(opener("2026-08-21T17:30:00Z"), SEASON)).toBe(true)
  })

  it("does not match while fpl is still serving last season", () => {
    expect(isFplSeason(opener("2025-08-15T17:30:00Z"), SEASON)).toBe(false)
  })

  it("does not match when fpl lists no opening gameweek", () => {
    expect(isFplSeason([{ id: 2, deadline_time: "2026-08-28T17:30:00Z" }], SEASON)).toBe(false)
  })
})

describe("summariseSurvivalStreaks", () => {
  it("shows the database values exactly as stored", () => {
    const summary = summariseSurvivalStreaks(
      [record({ person: "rory-sproule", weeksSinceLoss: 31, asOfGameweek: 2 })],
      SEASON,
    )

    expect(summary.streaks).toEqual([
      { person: "rory-sproule", league: "premiership", weeksSinceLoss: 31 },
    ])
  })

  it("reports the least recently recorded gameweek so the page never overstates how fresh it is", () => {
    const summary = summariseSurvivalStreaks(
      [record({ asOfGameweek: 10 }), record({ person: "rory-sproule", asOfGameweek: 9 })],
      SEASON,
    )

    expect(summary).toMatchObject({ asOfSeason: SEASON, asOfGameweek: 9 })
  })

  it("reports a previous season ahead of any gameweek in the current one", () => {
    const summary = summariseSurvivalStreaks(
      [record({ asOfGameweek: 1 }), record({ asOfSeason: LAST_SEASON, asOfGameweek: 30 })],
      SEASON,
    )

    expect(summary).toMatchObject({ asOfSeason: LAST_SEASON, asOfGameweek: 30 })
  })

  it("falls back to the start of the current season without any records", () => {
    expect(summariseSurvivalStreaks([], SEASON)).toEqual({
      asOfSeason: SEASON,
      asOfGameweek: 0,
      streaks: [],
    })
  })
})

describe("rankSurvivalStreaks", () => {
  const streak = (person: string, league: SurvivalStreak["league"], weeks: number) => ({
    person,
    league,
    weeksSinceLoss: weeks,
  })

  it("orders longest streak first and shares a rank between ties", () => {
    const ranked = rankSurvivalStreaks([
      streak("stuart-collinson", "premiership", 7),
      streak("rory-sproule", "premiership", 31),
      streak("tony-mccracken", "championship", 7),
      streak("jamie-marks", "championship", 6),
    ])

    expect(ranked.map((row) => [row.person, row.rank])).toEqual([
      ["rory-sproule", 1],
      ["stuart-collinson", 2],
      ["tony-mccracken", 2],
      ["jamie-marks", 4],
    ])
  })

  it("returns an empty list for no streaks", () => {
    expect(rankSurvivalStreaks([])).toEqual([])
  })
})
