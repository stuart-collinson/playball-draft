import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import { afterEach, describe, expect, it, vi } from "vitest"

const MISSING_LEAGUE_ID = 32779

const stubFetch = (response: Partial<Response>): void => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}), ...response }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("fetchLeagueDetails", () => {
  it("returns the league payload when the league exists", async () => {
    const payload = {
      league: { id: MISSING_LEAGUE_ID, start_event: 1 },
      league_entries: [{ id: 1 }],
      standings: [{ league_entry: 1, total: 42 }],
    }
    stubFetch({ json: async () => payload })

    const details = await fetchLeagueDetails(MISSING_LEAGUE_ID)

    expect(details).toEqual(payload)
  })

  it("degrades to an empty league when the league no longer exists", async () => {
    stubFetch({ ok: false, status: 404, statusText: "Not Found" })

    const details = await fetchLeagueDetails(MISSING_LEAGUE_ID)

    expect(details.league.id).toBe(MISSING_LEAGUE_ID)
    expect(details.league_entries).toEqual([])
    expect(details.standings).toEqual([])
  })

  it("degrades to an empty league when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    const details = await fetchLeagueDetails(MISSING_LEAGUE_ID)

    expect(details.standings).toEqual([])
  })

  it("starts an empty league at gameweek one so points-per-gameweek stays finite", async () => {
    stubFetch({ ok: false, status: 404, statusText: "Not Found" })

    const details = await fetchLeagueDetails(MISSING_LEAGUE_ID)

    expect(details.league.start_event).toBe(1)
  })
})
