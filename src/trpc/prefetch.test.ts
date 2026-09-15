import { LEAGUE_IDS } from "@pbd/lib/constants/Fpl"
import { STAT_VIEWS } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import { prefetchHeaderQueries, prefetchStatQuery } from "@pbd/trpc/prefetch"
import { beforeEach, describe, expect, it, vi } from "vitest"

type RecordedKey = [string[], { input?: unknown; type: "query" }]

const prefetchedKeys = vi.hoisted(() => [] as RecordedKey[])

vi.mock("@pbd/trpc/server", () => {
  const optionsProxy = (path: string[]): object =>
    new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop !== "string") return undefined
          if (prop !== "queryOptions") return optionsProxy([...path, prop])

          return (input?: unknown) => ({
            queryKey:
              input === undefined ? [path, { type: "query" }] : [path, { input, type: "query" }],
          })
        },
      },
    )

  return {
    api: optionsProxy([]),
    getQueryClient: () => ({
      prefetchQuery: (options: { queryKey: RecordedKey }): Promise<void> => {
        prefetchedKeys.push(options.queryKey)
        return Promise.resolve()
      },
    }),
  }
})

const BOTH_LEAGUES = [LEAGUE_IDS.PREMIERSHIP, LEAGUE_IDS.CHAMPIONSHIP]

const ALL_STATS = Object.keys(STAT_VIEWS) as StatSlug[]

const procedurePath = (key: RecordedKey): string => key[0].join(".")

const inputsFor = (path: string): unknown[] =>
  prefetchedKeys.filter((key) => procedurePath(key) === path).map((key) => key[1].input)

beforeEach(() => {
  prefetchedKeys.length = 0
})

describe("prefetchStatQuery", () => {
  it("warms at least one fpl or survival query for every stat", async () => {
    for (const stat of ALL_STATS) {
      prefetchedKeys.length = 0

      await prefetchStatQuery(stat, BOTH_LEAGUES)

      expect(prefetchedKeys.length, stat).toBeGreaterThan(0)
      for (const key of prefetchedKeys) expect(key[0][0], stat).toMatch(/^(fpl|survival)$/)
    }
  })

  it("warms the chart stats one league at a time, the way the chart hooks ask", async () => {
    await prefetchStatQuery("points-race", BOTH_LEAGUES)

    expect(inputsFor("fpl.positionHistory")).toEqual([
      { leagueIds: [LEAGUE_IDS.PREMIERSHIP] },
      { leagueIds: [LEAGUE_IDS.CHAMPIONSHIP] },
    ])
  })

  it("forwards the waiver spec fields the waivers table passes to its hook", async () => {
    await prefetchStatQuery("one-week-wonders", BOTH_LEAGUES)

    expect(inputsFor("fpl.bestWaivers")).toEqual([
      { leagueIds: BOTH_LEAGUES, sortBy: "total", maxGws: 1, limit: 10 },
    ])
  })

  it("forwards the trade spec fields without a limit, the way the trades table does", async () => {
    await prefetchStatQuery("best-trades-ppg", BOTH_LEAGUES)

    expect(inputsFor("fpl.bestTrades")).toEqual([
      { leagueIds: BOTH_LEAGUES, sortBy: "avg", minGws: 3 },
    ])
  })

  it("warms only the survival list for the survival streak stat", async () => {
    await prefetchStatQuery("survival-streak", BOTH_LEAGUES)

    expect(prefetchedKeys.map(procedurePath)).toEqual(["survival.list"])
  })
})

describe("prefetchHeaderQueries", () => {
  it("warms the game state and both league tables", async () => {
    await prefetchHeaderQueries()

    expect(prefetchedKeys.map(procedurePath)).toContain("fpl.gameState")
    expect(inputsFor("fpl.leagueDetails")).toEqual([
      { leagueId: LEAGUE_IDS.PREMIERSHIP },
      { leagueId: LEAGUE_IDS.CHAMPIONSHIP },
    ])
  })

  it("warms the live header queries one league at a time, never combined", async () => {
    await prefetchHeaderQueries()

    for (const path of ["fpl.currentGwPoints", "fpl.currentGwGoalsAndAssists"]) {
      expect(inputsFor(path), path).toEqual([
        { leagueIds: [LEAGUE_IDS.PREMIERSHIP] },
        { leagueIds: [LEAGUE_IDS.CHAMPIONSHIP] },
      ])
    }
  })
})
