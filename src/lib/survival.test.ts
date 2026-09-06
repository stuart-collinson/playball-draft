import { foldSurvivalStreaks, rankSurvivalStreaks, resolveGameweekLoser } from "@pbd/lib/survival"
import type { GameweekVerdict } from "@pbd/lib/survival"
import type { SurvivalBaseline, SurvivalStreak } from "@pbd/types/survival.types"
import { describe, expect, it } from "vitest"

const SEASON = "2026/27"
const LAST_SEASON = "2025/26"
const FINAL_GAMEWEEK = 38

const baseline = (overrides: Partial<SurvivalBaseline> = {}): SurvivalBaseline => ({
  person: "stuart-collinson",
  league: "premiership",
  weeksSinceLoss: 7,
  asOfSeason: SEASON,
  asOfGameweek: 2,
  ...overrides,
})

const PREM_PLAYERS = ["stuart-collinson", "thomas-campbell", "rory-sproule"]

const verdict = (overrides: Partial<GameweekVerdict> = {}): GameweekVerdict => ({
  event: 3,
  league: "premiership",
  loser: "thomas-campbell",
  players: PREM_PLAYERS,
  ...overrides,
})

const fold = (baselines: SurvivalBaseline[], verdicts: GameweekVerdict[]) =>
  foldSurvivalStreaks(baselines, verdicts, { currentSeason: SEASON, finalGameweek: FINAL_GAMEWEEK })

const weeksFor = (streaks: SurvivalStreak[], person: string): number | undefined =>
  streaks.find((streak) => streak.person === person)?.weeksSinceLoss

describe("resolveGameweekLoser", () => {
  it("names the lowest scorer", () => {
    const loser = resolveGameweekLoser([
      { person: "a", points: 61, goals: 3, tableRank: 1 },
      { person: "b", points: 40, goals: 3, tableRank: 2 },
      { person: "c", points: 55, goals: 3, tableRank: 3 },
    ])

    expect(loser).toBe("b")
  })

  it("breaks a tie at the bottom on goals, then table position", () => {
    const onGoals = resolveGameweekLoser([
      { person: "a", points: 40, goals: 2, tableRank: 1 },
      { person: "b", points: 40, goals: 0, tableRank: 2 },
    ])
    const onTable = resolveGameweekLoser([
      { person: "a", points: 40, goals: 1, tableRank: 5 },
      { person: "b", points: 40, goals: 1, tableRank: 2 },
    ])

    expect(onGoals).toBe("b")
    expect(onTable).toBe("a")
  })

  it("returns null for an empty gameweek", () => {
    expect(resolveGameweekLoser([])).toBeNull()
  })
})

describe("foldSurvivalStreaks", () => {
  it("resets the loser to zero and adds a week to everyone else in that league", () => {
    const baselines = [
      baseline({ person: "stuart-collinson", weeksSinceLoss: 7 }),
      baseline({ person: "thomas-campbell", weeksSinceLoss: 0 }),
      baseline({ person: "rory-sproule", weeksSinceLoss: 31 }),
      baseline({ person: "quinn-tierney", league: "championship", weeksSinceLoss: 0 }),
    ]

    const { streaks, asOfGameweek } = fold(baselines, [verdict({ loser: "rory-sproule" })])

    expect(weeksFor(streaks, "stuart-collinson")).toBe(8)
    expect(weeksFor(streaks, "thomas-campbell")).toBe(1)
    expect(weeksFor(streaks, "rory-sproule")).toBe(0)
    expect(weeksFor(streaks, "quinn-tierney")).toBe(0)
    expect(asOfGameweek).toBe(3)
  })

  it("folds gameweeks in order and ignores ones already in the baseline", () => {
    const baselines = [baseline({ weeksSinceLoss: 7, asOfGameweek: 2 })]
    const verdicts = [
      verdict({ event: 4, loser: "stuart-collinson" }),
      verdict({ event: 2, loser: "stuart-collinson" }),
      verdict({ event: 3, loser: "thomas-campbell" }),
      verdict({ event: 5, loser: "thomas-campbell" }),
    ]

    const { streaks, asOfGameweek } = fold(baselines, verdicts)

    expect(weeksFor(streaks, "stuart-collinson")).toBe(1)
    expect(asOfGameweek).toBe(5)
  })

  it("leaves a manager untouched by gameweeks they did not play in", () => {
    const baselines = [
      baseline({ person: "louis-watts", league: "championship", weeksSinceLoss: 2 }),
    ]
    const verdicts = [
      verdict({ league: "championship", loser: "quinn-tierney", players: ["quinn-tierney"] }),
    ]

    expect(weeksFor(fold(baselines, verdicts).streaks, "louis-watts")).toBe(2)
  })

  it("reports the baseline anchor when nothing new has finished", () => {
    const { asOfSeason, asOfGameweek, streaks } = fold([baseline({ weeksSinceLoss: 7 })], [])

    expect(asOfSeason).toBe(SEASON)
    expect(asOfGameweek).toBe(2)
    expect(weeksFor(streaks, "stuart-collinson")).toBe(7)
  })

  it("carries a fully baked previous season into the new one from gameweek one", () => {
    const baselines = [
      baseline({ weeksSinceLoss: 20, asOfSeason: LAST_SEASON, asOfGameweek: FINAL_GAMEWEEK }),
    ]
    const verdicts = [verdict({ event: 1, loser: "thomas-campbell" })]

    const { streaks, asOfSeason, asOfGameweek } = fold(baselines, verdicts)

    expect(weeksFor(streaks, "stuart-collinson")).toBe(21)
    expect(asOfSeason).toBe(SEASON)
    expect(asOfGameweek).toBe(1)
  })

  it("freezes a previous season baseline that was never baked to the final gameweek", () => {
    const baselines = [baseline({ weeksSinceLoss: 20, asOfSeason: LAST_SEASON, asOfGameweek: 30 })]
    const verdicts = [verdict({ event: 1, loser: "thomas-campbell" })]

    const { streaks, asOfSeason, asOfGameweek } = fold(baselines, verdicts)

    expect(weeksFor(streaks, "stuart-collinson")).toBe(20)
    expect(asOfSeason).toBe(LAST_SEASON)
    expect(asOfGameweek).toBe(30)
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
