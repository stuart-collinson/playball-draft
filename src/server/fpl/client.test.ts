import { fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const URL = "https://draft.premierleague.com/api/game"
const REVALIDATE_SECONDS = 5
const NETWORK_FETCH_MS = 100

const stubFetch = (response: Partial<Response>): void => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "x-cache": "MISS", age: "12", "edge-control": "max-age=60" }),
      json: async () => ({}),
      ...response,
    }),
  )
}

const simulateNetworkFetch = (): void => {
  vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValueOnce(NETWORK_FETCH_MS)
}

let log: ReturnType<typeof vi.spyOn>
let error: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => {})
  error = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("FPL fetch logging", () => {
  it("stays quiet when FPL answers normally, even on a network fetch", async () => {
    stubFetch({})
    simulateNetworkFetch()

    await fetchFpl(URL, REVALIDATE_SECONDS)

    expect(log).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  it("logs the edge cache headers of a network fetch when FPL_LOG_CACHE is 1", async () => {
    vi.stubEnv("FPL_LOG_CACHE", "1")
    stubFetch({})
    simulateNetworkFetch()

    await fetchFpl(URL, REVALIDATE_SECONDS)

    expect(log).toHaveBeenCalledWith(
      `[fpl] ${NETWORK_FETCH_MS}ms ${URL} x-cache=MISS age=12 edge-control=max-age=60`,
    )
  })

  it("logs the status and URL when FPL answers with an error", async () => {
    stubFetch({ ok: false, status: 503, statusText: "Service Unavailable" })

    const result = await fetchFplSafe(URL, REVALIDATE_SECONDS)

    expect(result).toBeNull()
    expect(error).toHaveBeenCalledWith(`[fpl] 503 Service Unavailable ${URL}`)
  })

  it("says nothing about a 404, because FPL has no picks for a gameweek that has not started", async () => {
    stubFetch({ ok: false, status: 404, statusText: "Not Found" })

    const result = await fetchFplSafe(URL, REVALIDATE_SECONDS)

    expect(result).toBeNull()
    expect(error).not.toHaveBeenCalled()
  })

  it("logs the URL when the request itself fails, and still rethrows it from fetchFpl", async () => {
    const failure = new Error("network down")
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(failure))

    await expect(fetchFpl(URL, REVALIDATE_SECONDS)).rejects.toBe(failure)

    expect(error).toHaveBeenCalledWith(`[fpl] request failed ${URL}`, failure)
  })
})
