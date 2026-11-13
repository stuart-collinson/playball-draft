import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import {
  pendingGameweeks,
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
  leagueId: 10,
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
      { person: "stuart-collinson", lost: false },
      { person: "rory-sproule", lost: true },
      { person: "thomas-campbell", lost: false },
    ])
  })

  it("marks nobody as lost when the loser can only be settled by a coin toss", () => {
    const outcomes = outcomesOf(verdict({ loserNeedsCoinToss: true }))

    expect(outcomes.every((outcome) => !outcome.lost)).toBe(true)
    expect(outcomes).toHaveLength(3)
  })

  it("skips managers who cannot be matched to a person", () => {
    const outcomes = outcomesOf(verdict({ playerApiIds: [STU_API_ID, 999] }))

    expect(outcomes).toEqual([{ person: "stuart-collinson", lost: false }])
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
