import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import { fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const GAME_URL = FPL_ENDPOINTS.game()
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
  vi.stubEnv("FPL_LOG_CACHE", "")
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

    await fetchFpl(GAME_URL, REVALIDATE_SECONDS)

    expect(log).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  it("logs the edge cache headers of a network fetch when FPL_LOG_CACHE is 1", async () => {
    vi.stubEnv("FPL_LOG_CACHE", "1")
    stubFetch({})
    simulateNetworkFetch()

    await fetchFpl(GAME_URL, REVALIDATE_SECONDS)

    expect(log).toHaveBeenCalledWith(
      `[fpl] ${NETWORK_FETCH_MS}ms ${GAME_URL} x-cache=MISS age=12 edge-control=max-age=60`,
    )
  })

  it("logs the URL and status when FPL answers with an error", async () => {
    stubFetch({ ok: false, status: 503, statusText: "Service Unavailable" })

    const result = await fetchFplSafe(GAME_URL, REVALIDATE_SECONDS)

    expect(result).toBeNull()
    expect(error).toHaveBeenCalledWith(
      `[fpl] ${GAME_URL} failed: FPL API error: 503 Service Unavailable`,
    )
  })

  it("logs a 404, because a dead league or entry ID answers 404 at season rollover", async () => {
    stubFetch({ ok: false, status: 404, statusText: "Not Found" })

    const result = await fetchFplSafe(GAME_URL, REVALIDATE_SECONDS)

    expect(result).toBeNull()
    expect(error).toHaveBeenCalledWith(`[fpl] ${GAME_URL} failed: FPL API error: 404 Not Found`)
  })

  it("logs a request that never got an answer on one line, cause included", async () => {
    const cause = new Error("getaddrinfo ENOTFOUND draft.premierleague.com")
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fetch failed", { cause })))

    const result = await fetchFplSafe(GAME_URL, REVALIDATE_SECONDS)

    expect(result).toBeNull()
    expect(error).toHaveBeenCalledWith(
      `[fpl] ${GAME_URL} failed: fetch failed: getaddrinfo ENOTFOUND draft.premierleague.com`,
    )
  })

  it("logs a body that is not JSON instead of swallowing it", async () => {
    stubFetch({
      json: async () => {
        throw new SyntaxError("Unexpected token '<'")
      },
    })

    const result = await fetchFplSafe(GAME_URL, REVALIDATE_SECONDS)

    expect(result).toBeNull()
    expect(error).toHaveBeenCalledWith(`[fpl] ${GAME_URL} failed: Unexpected token '<'`)
  })

  it("logs once and rethrows from fetchFpl, so callers still see the failure", async () => {
    const failure = new Error("fetch failed")
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(failure))

    await expect(fetchFpl(GAME_URL, REVALIDATE_SECONDS)).rejects.toBe(failure)

    expect(error).toHaveBeenCalledTimes(1)
  })
})
