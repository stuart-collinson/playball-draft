import {
  buildGameweekReturnsLookups,
  sumSquadLiveReturns,
  tallyGameweekReturns,
} from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { buildFixtureProgress } from "@pbd/lib/fpl/gameweek/toPlay"
import type {
  EntryEventPick,
  EventLiveFixture,
  EventLiveResponse,
  FplElement,
} from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

type Appearance = { fixtureId: number; minutes: number }

type Player = {
  element: number
  position: number
  team: number
  elementType: number
  appearances: Appearance[]
  goals?: number
  assists?: number
  cleanSheets?: number
}

type FixtureSpec = {
  id: number
  home: number
  away: number
  state: "upcoming" | "played"
  score?: [number, number]
  homeSide?: number[]
  awaySide?: number[]
}

const GOALKEEPER = 1
const DEFENDER = 2
const MIDFIELDER = 3
const FORWARD = 4

const fixture = ({
  id,
  home,
  away,
  state,
  score,
  homeSide = [],
  awaySide = [],
}: FixtureSpec): EventLiveFixture => ({
  id,
  team_h: home,
  team_a: away,
  started: state === "played",
  finished: false,
  finished_provisional: state === "played",
  kickoff_time: "2026-11-08T14:00:00Z",
  team_h_score: score ? score[0] : null,
  team_a_score: score ? score[1] : null,
  stats: [
    {
      s: "bps",
      h: homeSide.map((element) => ({ element, value: 10 })),
      a: awaySide.map((element) => ({ element, value: 10 })),
    },
  ],
})

const minutesPlayed = (player: Player): number =>
  player.appearances.reduce((total, appearance) => total + appearance.minutes, 0)

const liveFor = (players: Player[], fixtures: FixtureSpec[]): EventLiveResponse => ({
  fixtures: fixtures.map(fixture),
  elements: Object.fromEntries(
    players.map((player) => [
      String(player.element),
      {
        stats: {
          minutes: minutesPlayed(player),
          goals_scored: player.goals ?? 0,
          assists: player.assists ?? 0,
          clean_sheets: player.cleanSheets ?? 0,
          expected_goals: 0,
          expected_assists: 0,
          total_points: 0,
        },
        explain: player.appearances.map((appearance) => [
          [{ name: "Minutes played", points: 0, value: appearance.minutes, stat: "minutes" }],
          appearance.fixtureId,
        ]),
      },
    ]),
  ),
})

const elementsFor = (players: Player[]): FplElement[] =>
  players.map(
    (player) =>
      ({ id: player.element, team: player.team, element_type: player.elementType }) as FplElement,
  )

const picksFor = (players: Player[]): EntryEventPick[] =>
  players.map(
    (player) =>
      ({
        element: player.element,
        position: player.position,
        multiplier: 1,
        is_captain: false,
        is_vice_captain: false,
      }) as EntryEventPick,
  )

const liveReturns = (players: Player[], fixtures: FixtureSpec[]) =>
  sumSquadLiveReturns(
    picksFor(players),
    buildFixtureProgress(fixtures.map(fixture)),
    buildGameweekReturnsLookups(elementsFor(players), liveFor(players, fixtures)),
  )

const finalXiReturns = (players: Player[], fixtures: FixtureSpec[]) =>
  tallyGameweekReturns(
    players.map((player) => player.element),
    buildGameweekReturnsLookups(elementsFor(players), liveFor(players, fixtures)),
  )

const PLAYED_AT_HOME: FixtureSpec = { id: 11, home: 8, away: 15, state: "played", score: [2, 4] }

describe("sumSquadLiveReturns", () => {
  it("leaves the bench out even though the draft api marks every pick with a multiplier of one", () => {
    const squad: Player[] = [
      {
        element: 1,
        position: 1,
        team: 8,
        elementType: GOALKEEPER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
      },
      {
        element: 2,
        position: 2,
        team: 8,
        elementType: MIDFIELDER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        goals: 1,
        assists: 2,
      },
      {
        element: 3,
        position: 12,
        team: 8,
        elementType: GOALKEEPER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        assists: 1,
      },
      {
        element: 4,
        position: 13,
        team: 8,
        elementType: MIDFIELDER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        goals: 7,
        assists: 3,
      },
    ]

    const returns = liveReturns(squad, [PLAYED_AT_HOME])

    expect(returns).toMatchObject({ goals: 1, assists: 2, goalsConceded: 8 })
  })

  it("counts a bench player's returns once they replace a starter whose match passed without them playing", () => {
    const squad: Player[] = [
      {
        element: 1,
        position: 1,
        team: 8,
        elementType: GOALKEEPER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
      },
      {
        element: 2,
        position: 2,
        team: 8,
        elementType: MIDFIELDER,
        appearances: [{ fixtureId: 11, minutes: 0 }],
      },
      {
        element: 3,
        position: 12,
        team: 8,
        elementType: MIDFIELDER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        goals: 2,
        assists: 1,
      },
    ]

    const returns = liveReturns(squad, [PLAYED_AT_HOME])

    expect(returns).toEqual({ goals: 2, assists: 1, cleanSheets: 0, goalsConceded: 8 })
  })

  it("keeps the bench out while the starter they would replace has not kicked off yet", () => {
    const squad: Player[] = [
      {
        element: 1,
        position: 1,
        team: 3,
        elementType: GOALKEEPER,
        appearances: [{ fixtureId: 12, minutes: 0 }],
      },
      {
        element: 2,
        position: 12,
        team: 8,
        elementType: GOALKEEPER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        goals: 1,
      },
    ]

    const returns = liveReturns(squad, [
      { id: 12, home: 3, away: 9, state: "upcoming" },
      PLAYED_AT_HOME,
    ])

    expect(returns).toEqual({ goals: 0, assists: 0, cleanSheets: 0, goalsConceded: 0 })
  })
})

describe("tallyGameweekReturns", () => {
  it("counts clean sheets for goalkeepers and defenders only", () => {
    const xi: Player[] = [
      {
        element: 1,
        position: 1,
        team: 8,
        elementType: GOALKEEPER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        cleanSheets: 1,
      },
      {
        element: 2,
        position: 2,
        team: 8,
        elementType: DEFENDER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        cleanSheets: 1,
      },
      {
        element: 3,
        position: 3,
        team: 8,
        elementType: MIDFIELDER,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        cleanSheets: 1,
      },
      {
        element: 4,
        position: 4,
        team: 8,
        elementType: FORWARD,
        appearances: [{ fixtureId: 11, minutes: 90 }],
        cleanSheets: 1,
      },
    ]

    const returns = finalXiReturns(xi, [{ ...PLAYED_AT_HOME, score: [1, 0] }])

    expect(returns.cleanSheets).toBe(2)
  })

  it("charges each player with everything their team conceded, even goals let in after they went off", () => {
    const xi: Player[] = [
      {
        element: 1,
        position: 1,
        team: 8,
        elementType: MIDFIELDER,
        appearances: [{ fixtureId: 11, minutes: 77 }],
      },
      {
        element: 2,
        position: 2,
        team: 15,
        elementType: FORWARD,
        appearances: [{ fixtureId: 11, minutes: 90 }],
      },
    ]

    const returns = finalXiReturns(xi, [{ ...PLAYED_AT_HOME, score: [4, 4] }])

    expect(returns.goalsConceded).toBe(8)
  })

  it("uses the side fpl recorded for the fixture when a player has since moved clubs", () => {
    const movedFromAwayTeam: Player = {
      element: 1,
      position: 1,
      team: 8,
      elementType: DEFENDER,
      appearances: [{ fixtureId: 11, minutes: 90 }],
    }

    const returns = finalXiReturns(
      [movedFromAwayTeam],
      [{ ...PLAYED_AT_HOME, score: [3, 1], awaySide: [movedFromAwayTeam.element] }],
    )

    expect(returns.goalsConceded).toBe(3)
  })

  it("only counts the fixtures a player actually played in during a double gameweek", () => {
    const doubleGameweekDefender: Player = {
      element: 1,
      position: 1,
      team: 8,
      elementType: DEFENDER,
      appearances: [
        { fixtureId: 11, minutes: 90 },
        { fixtureId: 12, minutes: 0 },
      ],
    }

    const returns = finalXiReturns(
      [doubleGameweekDefender],
      [
        { ...PLAYED_AT_HOME, score: [1, 2] },
        { id: 12, home: 20, away: 8, state: "played", score: [5, 0] },
      ],
    )

    expect(returns.goalsConceded).toBe(2)
  })

  it("adds nothing for a picked player who never got on the pitch", () => {
    const unused: Player = {
      element: 1,
      position: 1,
      team: 8,
      elementType: GOALKEEPER,
      appearances: [{ fixtureId: 11, minutes: 0 }],
    }

    const returns = finalXiReturns([unused], [{ ...PLAYED_AT_HOME, score: [0, 6] }])

    expect(returns).toEqual({ goals: 0, assists: 0, cleanSheets: 0, goalsConceded: 0 })
  })
})
