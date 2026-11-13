import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type { GameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import { resolveSurvivalStreaks } from "@pbd/server/survival/streaks"
import type { BootstrapStaticResponse } from "@pbd/types/fpl.types"
import type { SurvivalOutcome, SurvivalRecord } from "@pbd/types/survival.types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { listSurvivalRecords, recordSurvivalGameweek, fetchBootstrapStatic, fetchGameweekVerdicts } =
  vi.hoisted(() => ({
    listSurvivalRecords: vi.fn<() => Promise<SurvivalRecord[]>>(),
    recordSurvivalGameweek:
      vi.fn<(season: string, gameweek: number, outcomes: SurvivalOutcome[]) => Promise<void>>(),
    fetchBootstrapStatic: vi.fn<() => Promise<BootstrapStaticResponse>>(),
    fetchGameweekVerdicts: vi.fn<() => Promise<GameweekVerdicts>>(),
  }))

vi.mock("@pbd/server/survival/repository", () => ({ listSurvivalRecords, recordSurvivalGameweek }))

vi.mock("@pbd/server/fpl/bootstrap", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pbd/server/fpl/bootstrap")>()),
  fetchBootstrapStatic,
}))

vi.mock("@pbd/server/fpl/gameweekVerdicts", () => ({ fetchGameweekVerdicts }))

const STU_API_ID = 1
const RORY_API_ID = 2

const SEASON_OPENER = "2026-08-21T17:30:00Z"

const PREVIOUS_SEASON_OPENER = "2025-08-15T17:30:00Z"

const record = (person: string, asOfGameweek: number): SurvivalRecord => ({
  person,
  league: "premiership",
  weeksSinceLoss: 4,
  asOfSeason: CURRENT_SEASON,
  asOfGameweek,
})

const bootstrapWith = (finished: number[], openerDeadline = SEASON_OPENER) =>
  ({
    events: {
      current: null,
      next: null,
      data: [1, 2, 3, 4].map((id) => ({
        id,
        deadline_time: id === 1 ? openerDeadline : `2026-09-0${id}T17:30:00Z`,
        finished: finished.includes(id),
      })),
    },
  }) as unknown as BootstrapStaticResponse

const verdict = (event: number, loserApiId: number): GameweekVerdict => ({
  leagueId: LEAGUE_SLUG_TO_ID.premiership,
  event,
  winnerApiId: loserApiId === STU_API_ID ? RORY_API_ID : STU_API_ID,
  loserApiId,
  loserNeedsCoinToss: false,
  playerApiIds: [STU_API_ID, RORY_API_ID],
})

const seasonEntry = (entryApiId: number, managerName: string) => ({
  entryApiId,
  entryId: entryApiId,
  leagueId: LEAGUE_SLUG_TO_ID.premiership,
  managerName,
  teamName: "",
  rows: [],
})

const verdictsWith = (
  verdicts: GameweekVerdict[],
  eventsMissingPicks: number[] = [],
): GameweekVerdicts => ({
  verdicts,
  eventsMissingPicks,
  season: {
    finishedEvents: [],
    stopEvent: 38,
    entries: [
      seasonEntry(STU_API_ID, "Stuart Collinson"),
      seasonEntry(RORY_API_ID, "Rory Sproule"),
    ],
  },
})

const recordedGameweeks = (): unknown[] => recordSurvivalGameweek.mock.calls.map((call) => call[1])

const storeRows = (initial: SurvivalRecord[]) => {
  let rows = initial
  listSurvivalRecords.mockImplementation(async () => rows)
  recordSurvivalGameweek.mockImplementation(async (season, gameweek, outcomes) => {
    const decided = new Set(outcomes.map((outcome) => outcome.person))
    rows = rows.map((row) =>
      row.asOfGameweek === gameweek - 1 && decided.has(row.person)
        ? { ...row, asOfSeason: season, asOfGameweek: gameweek }
        : row,
    )
  })
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined)
  vi.spyOn(console, "warn").mockImplementation(() => undefined)
  storeRows([record("stuart-collinson", 2), record("rory-sproule", 2)])
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe("resolveSurvivalStreaks", () => {
  it("records every finished gameweek the database is missing, oldest first", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([verdict(3, STU_API_ID), verdict(4, RORY_API_ID)]),
    )

    await resolveSurvivalStreaks()

    expect(recordSurvivalGameweek.mock.calls).toEqual([
      [
        CURRENT_SEASON,
        3,
        [
          { person: "stuart-collinson", league: "premiership", lost: true },
          { person: "rory-sproule", league: "premiership", lost: false },
        ],
      ],
      [
        CURRENT_SEASON,
        4,
        [
          { person: "stuart-collinson", league: "premiership", lost: false },
          { person: "rory-sproule", league: "premiership", lost: true },
        ],
      ],
    ])
  })

  it("stops before a gameweek whose tie-break picks did not load, so it is retried later", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([verdict(3, STU_API_ID), verdict(4, RORY_API_ID)], [4]),
    )

    await resolveSurvivalStreaks()

    expect(recordedGameweeks()).toEqual([3])
  })

  it("stops before a gameweek with no result for someone in the survival table", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([
        verdict(3, STU_API_ID),
        { ...verdict(4, STU_API_ID), playerApiIds: [STU_API_ID] },
      ]),
    )

    await resolveSurvivalStreaks()

    expect(recordedGameweeks()).toEqual([3])
  })

  it("keeps catching up when someone's row is already ahead of the rest", async () => {
    storeRows([record("stuart-collinson", 2), record("rory-sproule", 2), record("luke-niblock", 4)])
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([verdict(3, STU_API_ID), verdict(4, RORY_API_ID)]),
    )

    await resolveSurvivalStreaks()

    expect(recordedGameweeks()).toEqual([3, 4])
  })

  it("records nothing while fpl is still serving a different season", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4], PREVIOUS_SEASON_OPENER))

    await resolveSurvivalStreaks()

    expect(fetchGameweekVerdicts).not.toHaveBeenCalled()
    expect(recordSurvivalGameweek).not.toHaveBeenCalled()
  })

  it("leaves fpl alone when the database is already up to date", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2]))

    await resolveSurvivalStreaks()

    expect(fetchGameweekVerdicts).not.toHaveBeenCalled()
    expect(listSurvivalRecords).toHaveBeenCalledTimes(1)
  })
})
