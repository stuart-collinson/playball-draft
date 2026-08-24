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

  it("leaves live once the finished flag has flipped", () => {
    const fixtures = [fixture({ started: true, finished: true, finished_provisional: false })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("idle")
  })

  it("leaves live at full time, when the draft API has only flipped the provisional flag", () => {
    const fixtures = [fixture({ started: true, finished: false, finished_provisional: true })]

    expect(deriveGamePhase(fixtures, NOW)).toBe("idle")
  })

  it("holds imminent through the bonus window after a full-time whistle", () => {
    const fixtures = [
      fixture({
        started: true,
        finished: false,
        finished_provisional: true,
        kickoff_time: "2026-08-22T11:00:00Z",
      }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("imminent")
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

  it("stays imminent for a while after the last match settles so late corrections land", () => {
    const fixtures = [
      fixture({
        started: true,
        finished: true,
        finished_provisional: true,
        kickoff_time: "2026-08-22T11:00:00Z",
      }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("imminent")
  })

  it("returns idle once the post-match cooldown has passed", () => {
    const fixtures = [
      fixture({
        started: true,
        finished: true,
        finished_provisional: true,
        kickoff_time: "2026-08-22T06:00:00Z",
      }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("idle")
  })

  it("returns break between batches once a settled match falls outside the cooldown", () => {
    const fixtures = [
      fixture({
        started: true,
        finished: true,
        finished_provisional: true,
        kickoff_time: "2026-08-22T06:00:00Z",
      }),
      fixture({ id: 2, kickoff_time: "2026-08-23T13:00:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("break")
  })

  it("prefers imminent over break while a settled match is inside the cooldown", () => {
    const fixtures = [
      fixture({
        started: true,
        finished: true,
        finished_provisional: true,
        kickoff_time: "2026-08-22T11:00:00Z",
      }),
      fixture({ id: 2, kickoff_time: "2026-08-23T13:00:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, NOW)).toBe("imminent")
  })

  it("returns idle for an empty fixture list", () => {
    expect(deriveGamePhase([], NOW)).toBe("idle")
  })
})

describe("deriveGamePhase against a real gameweek of draft-API fixtures", () => {
  const fullTime = (id: number, kickoff: string): EventLiveFixture =>
    fixture({
      id,
      started: true,
      finished: false,
      finished_provisional: true,
      kickoff_time: kickoff,
    })

  const playedOutGameweek = [
    fullTime(1, "2026-08-21T19:00:00Z"),
    fullTime(2, "2026-08-22T11:30:00Z"),
    fullTime(3, "2026-08-22T14:00:00Z"),
    fullTime(4, "2026-08-22T16:30:00Z"),
    fullTime(5, "2026-08-23T13:00:00Z"),
    fullTime(6, "2026-08-23T15:30:00Z"),
    fixture({ id: 7, kickoff_time: "2026-08-24T19:00:00Z" }),
  ]

  it("relaxes to break on the quiet day before the last match of the gameweek", () => {
    expect(deriveGamePhase(playedOutGameweek, new Date("2026-08-24T04:00:00Z"))).toBe("break")
  })

  it("goes imminent as the last match of the gameweek approaches", () => {
    expect(deriveGamePhase(playedOutGameweek, new Date("2026-08-24T18:45:00Z"))).toBe("imminent")
  })

  it("goes live once the last match of the gameweek kicks off", () => {
    const kickedOff = playedOutGameweek.map((f) => (f.id === 7 ? { ...f, started: true } : f))

    expect(deriveGamePhase(kickedOff, new Date("2026-08-24T19:30:00Z"))).toBe("live")
  })
})

describe("deriveGamePhase across midweek and double-gameweek schedules", () => {
  const settled = (kickoff: string, id = 1): EventLiveFixture =>
    fixture({
      id,
      started: true,
      finished: true,
      finished_provisional: true,
      kickoff_time: kickoff,
    })

  it("keeps a break alive between the weekend and midweek batches of a double gameweek", () => {
    const fixtures = [
      settled("2026-12-26T15:00:00Z"),
      fixture({ id: 2, kickoff_time: "2026-12-29T19:30:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, new Date("2026-12-28T12:00:00Z"))).toBe("break")
  })

  it("goes imminent before a midweek kickoff regardless of the day of the week", () => {
    const fixtures = [
      settled("2026-12-26T15:00:00Z"),
      fixture({ id: 2, kickoff_time: "2026-12-29T19:30:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, new Date("2026-12-29T19:05:00Z"))).toBe("imminent")
  })

  it("goes live during a Tuesday night match exactly as it would on a Saturday", () => {
    const fixtures = [
      settled("2026-12-26T15:00:00Z"),
      fixture({ id: 2, started: true, kickoff_time: "2026-12-29T19:30:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, new Date("2026-12-29T20:15:00Z"))).toBe("live")
  })

  it("bridges staggered festive kickoffs with the post-match cooldown", () => {
    const fixtures = [
      settled("2026-12-29T12:30:00Z"),
      fixture({ id: 2, kickoff_time: "2026-12-29T17:30:00Z" }),
    ]

    expect(deriveGamePhase(fixtures, new Date("2026-12-29T15:00:00Z"))).toBe("imminent")
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
