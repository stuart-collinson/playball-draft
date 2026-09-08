import { sumSquadLiveReturns } from "@pbd/lib/fpl/liveReturns"
import type { LiveReturnsLookups } from "@pbd/lib/fpl/liveReturns"
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
  goals: number
  assists: number
}

const buildLookups = (squad: SquadMember[]): LiveReturnsLookups => {
  const lookups: SquadLookups = {
    teamByElement: new Map(squad.map((member) => [member.element, member.team])),
    typeByElement: new Map(squad.map((member) => [member.element, member.elementType])),
    minutesByElement: new Map(squad.map((member) => [member.element, member.minutes])),
  }

  return {
    ...lookups,
    returnsByElement: new Map(
      squad.map((member) => [member.element, { goals: member.goals, assists: member.assists }]),
    ),
  }
}

const GOALKEEPER = 1
const MIDFIELDER = 3

describe("sumSquadLiveReturns", () => {
  it("leaves the bench out even though the draft api marks every pick with a multiplier of one", () => {
    const squad: SquadMember[] = [
      {
        element: 1,
        position: 1,
        team: 8,
        elementType: GOALKEEPER,
        minutes: 90,
        goals: 0,
        assists: 0,
      },
      {
        element: 2,
        position: 2,
        team: 8,
        elementType: MIDFIELDER,
        minutes: 90,
        goals: 1,
        assists: 2,
      },
      {
        element: 3,
        position: 12,
        team: 8,
        elementType: GOALKEEPER,
        minutes: 90,
        goals: 0,
        assists: 1,
      },
      {
        element: 4,
        position: 13,
        team: 8,
        elementType: MIDFIELDER,
        minutes: 90,
        goals: 7,
        assists: 3,
      },
    ]
    const progress = buildFixtureProgress([fixture(11, 8, 15, "played")])

    const returns = sumSquadLiveReturns(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(returns).toEqual({ goals: 1, assists: 2 })
  })

  it("counts a bench player's returns once they replace a starter whose match passed without them playing", () => {
    const squad: SquadMember[] = [
      {
        element: 1,
        position: 1,
        team: 8,
        elementType: GOALKEEPER,
        minutes: 90,
        goals: 0,
        assists: 0,
      },
      {
        element: 2,
        position: 2,
        team: 8,
        elementType: MIDFIELDER,
        minutes: 0,
        goals: 0,
        assists: 0,
      },
      {
        element: 3,
        position: 12,
        team: 8,
        elementType: MIDFIELDER,
        minutes: 90,
        goals: 2,
        assists: 1,
      },
    ]
    const progress = buildFixtureProgress([fixture(11, 8, 15, "played")])

    const returns = sumSquadLiveReturns(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(returns).toEqual({ goals: 2, assists: 1 })
  })

  it("keeps the bench out while the starter they would replace has not kicked off yet", () => {
    const squad: SquadMember[] = [
      {
        element: 1,
        position: 1,
        team: 3,
        elementType: GOALKEEPER,
        minutes: 0,
        goals: 0,
        assists: 0,
      },
      {
        element: 2,
        position: 12,
        team: 8,
        elementType: GOALKEEPER,
        minutes: 90,
        goals: 1,
        assists: 0,
      },
    ]
    const progress = buildFixtureProgress([
      fixture(12, 3, 9, "upcoming"),
      fixture(11, 8, 15, "played"),
    ])

    const returns = sumSquadLiveReturns(
      squad.map((member) => pick(member.element, member.position)),
      progress,
      buildLookups(squad),
    )

    expect(returns).toEqual({ goals: 0, assists: 0 })
  })
})
