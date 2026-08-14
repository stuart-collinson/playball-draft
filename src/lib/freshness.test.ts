import { FRESHNESS, GAME_STATE_POLL_INTERVALS, LIVE_POLL_INTERVALS } from "@pbd/lib/freshness"
import { minutes, seconds } from "@pbd/lib/time"
import { describe, expect, it } from "vitest"

// These are the knobs tuned against measured FPL edge-cache TTLs. The tests
// guard the invariants that make the tuning safe rather than the exact values.
describe("FRESHNESS tiers", () => {
  it("never garbage-collects a query while it is still fresh", () => {
    for (const [tier, { staleTime, gcTime }] of Object.entries(FRESHNESS)) {
      expect(gcTime, `${tier}: gcTime must be >= staleTime`).toBeGreaterThanOrEqual(staleTime)
    }
  })

  it("keeps every duration inside the 32-bit setTimeout ceiling", () => {
    // Values over ~24.8 days overflow the timer and garbage-collect almost
    // immediately — the opposite of the intent.
    const MAX_SAFE_TIMEOUT_MS = 2 ** 31 - 1

    for (const [tier, { staleTime, gcTime }] of Object.entries(FRESHNESS)) {
      expect(staleTime, `${tier}: staleTime overflows setTimeout`).toBeLessThan(MAX_SAFE_TIMEOUT_MS)
      expect(gcTime, `${tier}: gcTime overflows setTimeout`).toBeLessThan(MAX_SAFE_TIMEOUT_MS)
    }
  })

  it("keeps live data fresher than gameweek-scoped data", () => {
    expect(FRESHNESS.live.staleTime).toBeLessThan(FRESHNESS.matchDay.staleTime)
    expect(FRESHNESS.matchDay.staleTime).toBeLessThan(FRESHNESS.gameweek.staleTime)
    expect(FRESHNESS.gameweek.staleTime).toBeLessThan(FRESHNESS.stable.staleTime)
  })
})

describe("poll intervals", () => {
  it("does not poll live queries when there is nothing to watch", () => {
    expect(LIVE_POLL_INTERVALS.break).toBe(false)
    expect(LIVE_POLL_INTERVALS.idle).toBe(false)
  })

  it("polls fastest while matches are live", () => {
    expect(LIVE_POLL_INTERVALS.live).toBe(seconds(10))
    expect(LIVE_POLL_INTERVALS.imminent).toBe(seconds(60))
  })

  it("never polls faster than the FPL edge cache can serve new data", () => {
    // Fastly fronts the FPL API; polling below its TTL just re-reads bytes we
    // already have. 10s is the floor this app tunes to.
    const EDGE_FLOOR_MS = seconds(10)

    for (const [phase, interval] of Object.entries(LIVE_POLL_INTERVALS)) {
      if (interval === false) continue
      expect(interval, `${phase} polls below the edge floor`).toBeGreaterThanOrEqual(EDGE_FLOOR_MS)
    }
  })

  it("keeps the heartbeat running in every phase so kickoffs are noticed", () => {
    for (const [phase, interval] of Object.entries(GAME_STATE_POLL_INTERVALS)) {
      expect(interval, `${phase}: heartbeat must keep ticking`).toBeGreaterThan(0)
      expect(interval, `${phase}: heartbeat too slow to notice a kickoff`).toBeLessThanOrEqual(
        minutes(15),
      )
    }
  })

  it("checks for a kickoff at least as often once one is imminent", () => {
    expect(GAME_STATE_POLL_INTERVALS.imminent).toBeLessThanOrEqual(GAME_STATE_POLL_INTERVALS.break)
    expect(GAME_STATE_POLL_INTERVALS.break).toBeLessThanOrEqual(GAME_STATE_POLL_INTERVALS.idle)
  })
})
