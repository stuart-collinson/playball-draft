import { gameweekPointsFor, sumSquadLivePoints } from "@pbd/lib/fpl/livePoints"
import type { LivePointsLookups } from "@pbd/lib/fpl/livePoints"
import { buildFixtureProgress } from "@pbd/lib/fpl/toPlay"
import type { SquadLookups } from "@pbd/lib/fpl/toPlay"
import type { EntryEventPick, EventLiveFixture } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const fixture = (
  id: number,
  teamHome: number,
  teamAway: number,
  state: "upcoming" | "played",
): EventLiveFixture =>
  ({
    id,
    team_h: teamHome,
    team_a: teamAway,
    started: state === "played",
    finished: false,
    finished_provisional: state === "played",
    kickoff_time: "2026-08-28T19:00:00Z",
    minutes: state === "played" ? 90 : 0,
  }) as EventLiveFixture

const pick = (element: number, position: number): EntryEventPick =>
  ({
    element,
    position,
    multiplier: 1,
    is_captain: false,
    is_vice_captain: false,
  }) as EntryEventPick

type SquadMember = {
  element: number
  position: number
  team: number
  elementType: number
  minutes: number
  points: number
}

const buildLookups = (squad: SquadMember[]): LivePointsLookups => {
  const lookups: SquadLookups = {
    teamByElement: new Map(squad.map((member) => [member.element, member.team])),
    typeByElement: new Map(squad.map((member) => [member.element, member.elementType])),
    minutesByElement: new Map(squad.map((member) => [member.element, member.minutes])),
  }

  return {
    ...lookups,
    pointsByElement: new Map(squad.map((member) => [member.element, member.points])),
  }
}

const GOALKEEPER = 1
const MIDFIELDER = 3

describe("sumSquadLivePoints", () => {
  it("counts points from the one starter whose match has been played", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 8, elementType: GOALKEEPER, minutes: 90, points: 0 },
      { element: 2, position: 2, team: 15, elementType: MIDFIELDER, minutes: 81, points: 14 },
      ...Array.from({ length: 9 }, (_, index) => ({
        element: 10 + index,
        position: 3 + index,
        team: 3,
        elementType: MIDFIELDER,
        minutes: 0,
        points: 0,
      })),
      { element: 30, position: 12, team: 3, elementType: MIDFIELDER, minutes: 0, points: 0 },
    ]
    const progress = buildFixtureProgress([
      fixture(11, 8, 15, "played"),
      fixture(12, 3, 9, "upcoming"),
    ])

    const points = sumSquadLivePoints(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(points).toBe(14)
  })

  it("leaves the bench out of the total", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 8, elementType: GOALKEEPER, minutes: 90, points: 6 },
      { element: 2, position: 12, team: 8, elementType: GOALKEEPER, minutes: 90, points: 9 },
      { element: 3, position: 13, team: 8, elementType: MIDFIELDER, minutes: 90, points: 12 },
    ]
    const progress = buildFixtureProgress([fixture(11, 8, 15, "played")])

    const points = sumSquadLivePoints(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(points).toBe(6)
  })

  it("swaps in a bench player once a starter's match has passed without them playing", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 8, elementType: GOALKEEPER, minutes: 90, points: 3 },
      { element: 2, position: 2, team: 8, elementType: MIDFIELDER, minutes: 0, points: 0 },
      { element: 3, position: 12, team: 8, elementType: MIDFIELDER, minutes: 90, points: 7 },
    ]
    const progress = buildFixtureProgress([fixture(11, 8, 15, "played")])

    const points = sumSquadLivePoints(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(points).toBe(10)
  })

  it("keeps a starter who has not kicked off yet rather than replacing them", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 3, elementType: GOALKEEPER, minutes: 0, points: 0 },
      { element: 2, position: 12, team: 8, elementType: GOALKEEPER, minutes: 90, points: 7 },
    ]
    const progress = buildFixtureProgress([
      fixture(12, 3, 9, "upcoming"),
      fixture(11, 8, 15, "played"),
    ])

    const points = sumSquadLivePoints(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(points).toBe(0)
  })
})

describe("gameweekPointsFor", () => {
  it("uses the live total while the league standings still read zero", () => {
    expect(gameweekPointsFor(0, 14)).toBe(14)
  })

  it("uses the official total once the gameweek has been scored", () => {
    expect(gameweekPointsFor(52, 49)).toBe(52)
  })

  it("falls back to zero when live points are missing", () => {
    expect(gameweekPointsFor(0, undefined)).toBe(0)
  })
})
