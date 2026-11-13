import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type { GameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import { resolveSurvivalStreaks } from "@pbd/server/survival/streaks"
import type { BootstrapStaticResponse } from "@pbd/types/fpl.types"
import type { SurvivalOutcome, SurvivalRecord } from "@pbd/types/survival.types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const {
  listSurvivalRecords,
  recordSurvivalGameweek,
  fetchBootstrapStatic,
  fetchGameweekVerdicts,
  withUncachedFplReads,
} = vi.hoisted(() => ({
  listSurvivalRecords: vi.fn<() => Promise<SurvivalRecord[]>>(),
  recordSurvivalGameweek:
    vi.fn<(season: string, gameweek: number, outcomes: SurvivalOutcome[]) => Promise<string[]>>(),
  fetchBootstrapStatic: vi.fn<() => Promise<BootstrapStaticResponse>>(),
  fetchGameweekVerdicts:
    vi.fn<(leagueIds: number[], scope?: { events?: number[] }) => Promise<GameweekVerdicts>>(),
  withUncachedFplReads:
    vi.fn<(run: () => Promise<SurvivalRecord[]>) => Promise<SurvivalRecord[]>>(),
}))

vi.mock("@pbd/server/survival/repository", () => ({ listSurvivalRecords, recordSurvivalGameweek }))

vi.mock("@pbd/server/fpl/bootstrap", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pbd/server/fpl/bootstrap")>()),
  fetchBootstrapStatic,
}))

vi.mock("@pbd/server/fpl/gameweekVerdicts", () => ({ fetchGameweekVerdicts }))

vi.mock("@pbd/server/fpl/client", () => ({ withUncachedFplReads }))

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
  coinTossApiIds: [],
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
  scores: [],
  leagueDetails: [],
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
    const isWritten = (row: SurvivalRecord) =>
      row.asOfGameweek === gameweek - 1 && decided.has(row.person)
    const writtenPeople = rows.filter(isWritten).map((row) => row.person)
    rows = rows.map((row) =>
      isWritten(row) ? { ...row, asOfSeason: season, asOfGameweek: gameweek } : row,
    )
    return writtenPeople
  })
}

let isReadingUncached = false

beforeEach(() => {
  withUncachedFplReads.mockImplementation(async (run) => {
    isReadingUncached = true
    try {
      return await run()
    } finally {
      isReadingUncached = false
    }
  })
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

  it("shows the rows it just wrote without reading the survival table again", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([verdict(3, STU_API_ID), verdict(4, RORY_API_ID)]),
    )

    const summary = await resolveSurvivalStreaks()

    expect(summary.asOfGameweek).toBe(4)
    expect(listSurvivalRecords).toHaveBeenCalledTimes(3)
  })

  it("works out the results to write from uncached fpl data", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3]))
    const uncachedWhenFetched: boolean[] = []
    fetchGameweekVerdicts.mockImplementation(async () => {
      uncachedWhenFetched.push(isReadingUncached)
      return verdictsWith([verdict(3, STU_API_ID)])
    })

    await resolveSurvivalStreaks()

    expect(uncachedWhenFetched).toEqual([true])
    expect(recordedGameweeks()).toEqual([3])
  })

  it("asks fpl only about the gameweeks it is about to write", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([verdict(3, STU_API_ID), verdict(4, RORY_API_ID)]),
    )

    await resolveSurvivalStreaks()

    expect(fetchGameweekVerdicts.mock.calls[0]?.[1]).toEqual({ events: [3, 4] })
  })

  it("flags a coin-toss gameweek in the logs so the loser can be set by hand", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([{ ...verdict(3, STU_API_ID), coinTossApiIds: [RORY_API_ID, STU_API_ID] }]),
    )

    await resolveSurvivalStreaks()

    expect(recordedGameweeks()).toEqual([3])
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("GW3 premiership"))
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("between rory-sproule, stuart-collinson"),
    )
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("coin toss"))
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("as_of_gameweek - 3"))
  })

  it("leaves the coin-toss warning to the visit whose write actually landed", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([{ ...verdict(3, STU_API_ID), coinTossApiIds: [RORY_API_ID, STU_API_ID] }]),
    )
    recordSurvivalGameweek.mockResolvedValue([])

    await resolveSurvivalStreaks()

    expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining("coin toss"))
  })

  it("doesn't repeat the coin-toss warning when only someone outside the toss is caught up", async () => {
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3]))
    fetchGameweekVerdicts.mockResolvedValue(
      verdictsWith([{ ...verdict(3, STU_API_ID), coinTossApiIds: [RORY_API_ID, STU_API_ID] }]),
    )
    recordSurvivalGameweek.mockResolvedValue(["thomas-campbell"])

    await resolveSurvivalStreaks()

    expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining("coin toss"))
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

  it("stops before a gameweek where two managers resolve to the same person", async () => {
    const SECOND_STU_API_ID = 3
    const verdicts = verdictsWith([
      verdict(3, STU_API_ID),
      { ...verdict(4, RORY_API_ID), playerApiIds: [STU_API_ID, RORY_API_ID, SECOND_STU_API_ID] },
    ])
    fetchBootstrapStatic.mockResolvedValue(bootstrapWith([1, 2, 3, 4]))
    fetchGameweekVerdicts.mockResolvedValue({
      ...verdicts,
      season: {
        ...verdicts.season,
        entries: [...verdicts.season.entries, seasonEntry(SECOND_STU_API_ID, "Stuart Collinson")],
      },
    })

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
