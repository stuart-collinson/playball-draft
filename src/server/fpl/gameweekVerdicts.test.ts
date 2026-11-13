import { LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import type { SeasonScores } from "@pbd/server/fpl/seasonScores"
import type { fetchSquadWeekStats as FetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import type { LeagueDetailsResponse } from "@pbd/types/fpl.types"
import { beforeEach, describe, expect, it, vi } from "vitest"

type SquadWeeks = Awaited<ReturnType<typeof FetchSquadWeekStats>>

type SquadWeek = SquadWeeks extends Map<number, (infer Week)[]> ? Week : never

type SeasonScoresWithLeagues = { season: SeasonScores; leagueDetails: LeagueDetailsResponse[] }

const { fetchSeasonScoresWithLeagues, fetchSquadWeekStats } = vi.hoisted(() => ({
  fetchSeasonScoresWithLeagues: vi.fn<() => Promise<SeasonScoresWithLeagues>>(),
  fetchSquadWeekStats: vi.fn<(entries: unknown[], events: number[]) => Promise<SquadWeeks>>(),
}))

vi.mock("@pbd/server/fpl/seasonScores", () => ({ fetchSeasonScoresWithLeagues }))

vi.mock("@pbd/server/fpl/squadWeeks", () => ({ fetchSquadWeekStats }))

const LEAGUE_ID = LEAGUE_SLUG_TO_ID.premiership

const ENTRY_API_IDS = [1, 2, 3, 4]

const POINTS_BY_EVENT: Record<number, number[]> = {
  3: [60, 50, 30, 30],
  4: [70, 70, 40, 20],
}

const seasonScores = (): SeasonScores => ({
  finishedEvents: [3, 4],
  stopEvent: 38,
  entries: ENTRY_API_IDS.map((entryApiId, index) => ({
    entryApiId,
    entryId: entryApiId,
    leagueId: LEAGUE_ID,
    managerName: `Manager ${entryApiId}`,
    teamName: "",
    rows: [3, 4].map((event) => ({
      event,
      points: POINTS_BY_EVENT[event]?.[index] ?? 0,
      totalPoints: 100,
    })),
  })),
})

const squadWeek = (event: number, hasPicks: boolean): SquadWeek =>
  ({ event, hasPicks, returns: { ...NO_GAMEWEEK_RETURNS, goals: 1 } }) as SquadWeek

const squadWeeksWith = (missing: { entryApiId: number; event: number }[]): SquadWeeks =>
  new Map(
    ENTRY_API_IDS.map((entryApiId) => [
      entryApiId,
      [3, 4].map((event) =>
        squadWeek(
          event,
          !missing.some((week) => week.entryApiId === entryApiId && week.event === event),
        ),
      ),
    ]),
  )

const leagueWithTableOrder = (entryApiIdsTopFirst: number[]): LeagueDetailsResponse =>
  ({
    standings: entryApiIdsTopFirst.map((entryApiId, index) => ({
      league_entry: entryApiId,
      rank_sort: index + 1,
    })),
  }) as unknown as LeagueDetailsResponse

const seasonWithTableOrder = (entryApiIdsTopFirst: number[]): SeasonScoresWithLeagues => ({
  season: seasonScores(),
  leagueDetails: [leagueWithTableOrder(entryApiIdsTopFirst)],
})

beforeEach(() => {
  fetchSeasonScoresWithLeagues.mockResolvedValue(seasonWithTableOrder(ENTRY_API_IDS))
})

describe("fetchGameweekVerdicts", () => {
  it("reports no missing picks when every tied manager's picks loaded", async () => {
    fetchSquadWeekStats.mockResolvedValue(squadWeeksWith([]))

    const { eventsMissingPicks } = await fetchGameweekVerdicts([LEAGUE_ID])

    expect(eventsMissingPicks).toEqual([])
  })

  it("flags a gameweek whose tie-break is missing a tied manager's picks", async () => {
    fetchSquadWeekStats.mockResolvedValue(squadWeeksWith([{ entryApiId: 4, event: 3 }]))

    const { eventsMissingPicks } = await fetchGameweekVerdicts([LEAGUE_ID])

    expect(eventsMissingPicks).toEqual([3])
  })

  it("splits a coin-toss loser on the table from the same league fetch as the scores", async () => {
    fetchSquadWeekStats.mockResolvedValue(squadWeeksWith([]))

    const loserOfGameweekThree = async (tableOrder: number[]) => {
      fetchSeasonScoresWithLeagues.mockResolvedValue(seasonWithTableOrder(tableOrder))
      const { verdicts } = await fetchGameweekVerdicts([LEAGUE_ID])
      return verdicts.find((verdict) => verdict.event === 3)
    }

    expect(await loserOfGameweekThree([1, 2, 4, 3])).toMatchObject({
      loserApiId: 3,
      loserNeedsCoinToss: true,
    })
    expect((await loserOfGameweekThree([1, 2, 3, 4]))?.loserApiId).toBe(4)
  })

  it("only judges and fetches tie-break picks for the gameweeks asked about", async () => {
    fetchSquadWeekStats.mockResolvedValue(squadWeeksWith([]))

    const { verdicts } = await fetchGameweekVerdicts([LEAGUE_ID], { events: [4] })

    expect(verdicts.map((verdict) => verdict.event)).toEqual([4])
    expect(fetchSquadWeekStats.mock.lastCall?.[1]).toEqual([4])
  })

  it("fetches tie-break picks only for the managers tied in each gameweek", async () => {
    fetchSquadWeekStats.mockResolvedValue(squadWeeksWith([]))
    fetchSquadWeekStats.mockClear()

    await fetchGameweekVerdicts([LEAGUE_ID])

    const requested = fetchSquadWeekStats.mock.calls.map(([entries, events]) => ({
      entryApiIds: (entries as { entryApiId: number }[]).map((entry) => entry.entryApiId),
      events,
    }))
    expect(requested).toEqual([
      { entryApiIds: [3, 4], events: [3] },
      { entryApiIds: [1, 2], events: [4] },
    ])
  })

  it("ignores missing picks for a manager who was not tied that gameweek", async () => {
    fetchSquadWeekStats.mockResolvedValue(squadWeeksWith([{ entryApiId: 4, event: 4 }]))

    const { eventsMissingPicks } = await fetchGameweekVerdicts([LEAGUE_ID])

    expect(eventsMissingPicks).toEqual([])
  })
})
