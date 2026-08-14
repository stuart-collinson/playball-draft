import { deriveGamePhase } from "@pbd/lib/fpl/gamePhase"
import type { EventLiveFixture } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const NOW = new Date("2026-08-22T14:00:00Z")

const fixture = (overrides: Partial<EventLiveFixture>): EventLiveFixture => ({
  id: 1,
  started: false,
  finished: false,
  finished_provisional: false,
  kickoff_time: null,
  team_h: 1,
  team_a: 2,
  ...overrides,
})

describe("deriveGamePhase", () => {
  it("returns live when any fixture has started and not finished", () => {
    const fixtures = [
      fixture({ started: true, finished: false }),
      fixture({ id: 2, kickoff_time: "2026-08-23T13:00:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("live")
  })

  it("returns imminent when a kickoff is within 30 minutes", () => {
    const fixtures = [fixture({ kickoff_time: "2026-08-22T14:25:00Z" })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("imminent")
  })

  it("returns imminent when kickoff passed recently but started has not flipped", () => {
    const fixtures = [fixture({ kickoff_time: "2026-08-22T13:30:00Z" })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("imminent")
  })

  it("does not stay imminent for a fixture whose kickoff passed over two hours ago", () => {
    const fixtures = [fixture({ kickoff_time: "2026-08-22T10:00:00Z" })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("break")
  })

  it("stays live after the whistle until bonus points are settled", () => {
    // finished flips at full time, but bonus and stat corrections land after.
    const fixtures = [fixture({ started: true, finished: true, finished_provisional: false })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("live")
  })

  it("stays live when only the provisional flag has flipped", () => {
    const fixtures = [fixture({ started: true, finished: false, finished_provisional: true })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("live")
  })

  it("returns break when unstarted fixtures exist beyond the imminent window", () => {
    const fixtures = [
      fixture({ started: true, finished: true, finished_provisional: true }),
      fixture({ id: 2, kickoff_time: "2026-08-23T13:00:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("break")
  })

  it("returns idle once every fixture is played out and settled", () => {
    const fixtures = [fixture({ started: true, finished: true, finished_provisional: true })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("idle")
  })

  it("returns idle for an empty fixture list", () => {
    expect(deriveGamePhase([], NOW)).toBe("idle")
  })
})
