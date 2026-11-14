import { LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { NO_GAMEWEEK_RETURNS } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import type { SeasonScores } from "@pbd/server/fpl/seasonScores"
import type { fetchSquadWeeks as FetchSquadWeeks } from "@pbd/server/fpl/squadWeeks"
import type { LeagueDetailsResponse } from "@pbd/types/fpl.types"
import { beforeEach, describe, expect, it, vi } from "vitest"

type SquadWeeks = Awaited<ReturnType<typeof FetchSquadWeeks>>

type SquadWeekRequest = Parameters<typeof FetchSquadWeeks>[0][number]

type SquadWeek = SquadWeeks extends Map<number, (infer Week)[]> ? Week : never

type SeasonScoresWithLeagues = { season: SeasonScores; leagueDetails: LeagueDetailsResponse[] }

const { fetchSeasonScoresWithLeagues, fetchSquadWeeks } = vi.hoisted(() => ({
  fetchSeasonScoresWithLeagues: vi.fn<() => Promise<SeasonScoresWithLeagues>>(),
  fetchSquadWeeks: vi.fn<(requests: SquadWeekRequest[]) => Promise<SquadWeeks>>(),
}))

vi.mock("@pbd/server/fpl/seasonScores", () => ({ fetchSeasonScoresWithLeagues }))

vi.mock("@pbd/server/fpl/squadWeeks", () => ({ fetchSquadWeeks }))

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
    fetchSquadWeeks.mockResolvedValue(squadWeeksWith([]))

    const { eventsMissingPicks } = await fetchGameweekVerdicts([LEAGUE_ID])

    expect(eventsMissingPicks).toEqual([])
  })

  it("flags a gameweek whose tie-break is missing a tied manager's picks", async () => {
    fetchSquadWeeks.mockResolvedValue(squadWeeksWith([{ entryApiId: 4, event: 3 }]))

    const { eventsMissingPicks } = await fetchGameweekVerdicts([LEAGUE_ID])

    expect(eventsMissingPicks).toEqual([3])
  })

  it("splits a coin-toss loser on the table from the same league fetch as the scores", async () => {
    fetchSquadWeeks.mockResolvedValue(squadWeeksWith([]))

    const loserOfGameweekThree = async (tableOrder: number[]) => {
      fetchSeasonScoresWithLeagues.mockResolvedValue(seasonWithTableOrder(tableOrder))
      const { verdicts } = await fetchGameweekVerdicts([LEAGUE_ID])
      return verdicts.find((verdict) => verdict.event === 3)
    }

    expect(await loserOfGameweekThree([1, 2, 4, 3])).toMatchObject({
      loserApiId: 3,
      coinTossApiIds: [4, 3],
    })
    expect((await loserOfGameweekThree([1, 2, 3, 4]))?.loserApiId).toBe(4)
  })

  it("only judges and fetches tie-break picks for the gameweeks asked about", async () => {
    fetchSquadWeeks.mockResolvedValue(squadWeeksWith([]))

    const { verdicts } = await fetchGameweekVerdicts([LEAGUE_ID], { events: [4] })

    expect(verdicts.map((verdict) => verdict.event)).toEqual([4])
    const requestedEvents = fetchSquadWeeks.mock.lastCall?.[0].map((request) => request.event)
    expect(new Set(requestedEvents)).toEqual(new Set([4]))
  })

  it("fetches tie-break picks in one round, only for the managers tied in each gameweek", async () => {
    fetchSquadWeeks.mockResolvedValue(squadWeeksWith([]))
    fetchSquadWeeks.mockClear()

    await fetchGameweekVerdicts([LEAGUE_ID])

    expect(fetchSquadWeeks).toHaveBeenCalledTimes(1)
    expect(
      fetchSquadWeeks.mock.lastCall?.[0].map(({ entryApiId, event }) => ({ entryApiId, event })),
    ).toEqual([
      { entryApiId: 3, event: 3 },
      { entryApiId: 4, event: 3 },
      { entryApiId: 1, event: 4 },
      { entryApiId: 2, event: 4 },
    ])
  })

  it("ignores missing picks for a manager who was not tied that gameweek", async () => {
    fetchSquadWeeks.mockResolvedValue(squadWeeksWith([{ entryApiId: 4, event: 4 }]))

    const { eventsMissingPicks } = await fetchGameweekVerdicts([LEAGUE_ID])

    expect(eventsMissingPicks).toEqual([])
  })
})
