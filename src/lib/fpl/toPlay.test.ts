import { buildFixtureProgress, countSquadToPlay } from "@pbd/lib/fpl/toPlay"
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
}

const buildLookups = (squad: SquadMember[]): SquadLookups => ({
  teamByElement: new Map(squad.map((member) => [member.element, member.team])),
  typeByElement: new Map(squad.map((member) => [member.element, member.elementType])),
  minutesByElement: new Map(squad.map((member) => [member.element, member.minutes])),
})

const countFor = (squad: SquadMember[], fixtures: EventLiveFixture[]): number =>
  countSquadToPlay(
    squad.map((member) => pick(member.element, member.position)),
    buildFixtureProgress(fixtures),
    buildLookups(squad),
  )

const GOALKEEPER = 1
const MIDFIELDER = 3

describe("countSquadToPlay", () => {
  it("counts a starter whose match has not kicked off", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 3, elementType: GOALKEEPER, minutes: 0 },
      { element: 2, position: 2, team: 8, elementType: MIDFIELDER, minutes: 81 },
    ]

    expect(countFor(squad, [fixture(12, 3, 9, "upcoming"), fixture(11, 8, 15, "played")])).toBe(1)
  })

  it("counts the bench player who replaces a starter that never played", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 8, elementType: GOALKEEPER, minutes: 90 },
      { element: 2, position: 2, team: 8, elementType: MIDFIELDER, minutes: 0 },
      { element: 3, position: 12, team: 3, elementType: MIDFIELDER, minutes: 0 },
    ]

    expect(countFor(squad, [fixture(11, 8, 15, "played"), fixture(12, 3, 9, "upcoming")])).toBe(1)
  })

  it("ignores a starter with no fixture this gameweek", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 20, elementType: GOALKEEPER, minutes: 0 },
    ]

    expect(countFor(squad, [fixture(11, 8, 15, "played")])).toBe(0)
  })

  it("leaves nothing to play once every match has finished", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 8, elementType: GOALKEEPER, minutes: 90 },
      { element: 2, position: 2, team: 15, elementType: MIDFIELDER, minutes: 90 },
      { element: 3, position: 12, team: 8, elementType: MIDFIELDER, minutes: 0 },
    ]

    expect(countFor(squad, [fixture(11, 8, 15, "played")])).toBe(0)
  })

  it("uses the reserve goalkeeper for a keeper who did not play", () => {
    const squad: SquadMember[] = [
      { element: 1, position: 1, team: 8, elementType: GOALKEEPER, minutes: 0 },
      { element: 2, position: 12, team: 3, elementType: GOALKEEPER, minutes: 0 },
      { element: 3, position: 13, team: 3, elementType: MIDFIELDER, minutes: 0 },
    ]

    expect(countFor(squad, [fixture(11, 8, 15, "played"), fixture(12, 3, 9, "upcoming")])).toBe(1)
  })
})
