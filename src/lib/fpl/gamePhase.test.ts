import { deriveGamePhase, findNextDeadline } from "@pbd/lib/fpl/gamePhase"
import type { EventLiveFixture, FplEvent } from "@pbd/types/fpl.types"
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

describe("findNextDeadline", () => {
  const event = (id: number, deadline: string): FplEvent =>
    ({ id, deadline_time: deadline }) as FplEvent

  it("returns the soonest deadline still in the future", () => {
    const events = [
      event(2, "2026-08-28T17:30:00Z"),
      event(1, "2026-08-21T17:30:00Z"),
      event(3, "2026-09-04T17:30:00Z"),
    ]

    expect(findNextDeadline(events, new Date("2026-08-14T12:00:00Z"))).toBe("2026-08-21T17:30:00Z")
  })

  it("skips deadlines that have already passed", () => {
    const events = [event(1, "2026-08-21T17:30:00Z"), event(2, "2026-08-28T17:30:00Z")]

    expect(findNextDeadline(events, new Date("2026-08-22T12:00:00Z"))).toBe("2026-08-28T17:30:00Z")
  })

  it("returns null once every deadline has passed", () => {
    const events = [event(38, "2027-05-20T17:30:00Z")]

    expect(findNextDeadline(events, new Date("2027-06-01T12:00:00Z"))).toBeNull()
  })

  it("returns null when there are no events", () => {
    expect(findNextDeadline([], new Date("2026-08-14T12:00:00Z"))).toBeNull()
  })
})
