import { DEFENDER_ELEMENT_TYPE, GOALKEEPER_ELEMENT_TYPE } from "@pbd/lib/constants/Fpl"
import { scoringPicks } from "@pbd/lib/fpl/gameweek/toPlay"
import type { FixtureProgress } from "@pbd/lib/fpl/gameweek/toPlay"
import { isBenchPosition } from "@pbd/lib/fpl/stats/squadWeek"
import type {
  EntryEventPick,
  EventLiveExplainEntry,
  EventLiveFixture,
  EventLiveResponse,
  FplElement,
  GameweekReturns,
  GameweekReturnsLookups,
} from "@pbd/types/fpl.types"

type PlayedFixture = {
  fixture: EventLiveFixture
  concededByElement: Map<number, number>
}

type TeamConcededFor = (
  elementId: number,
  teamId: number | undefined,
  explain: EventLiveExplainEntry[],
) => number

type LiveElementEntry = readonly [number, EventLiveResponse["elements"][string]]

export const NO_GAMEWEEK_RETURNS: GameweekReturns = {
  goals: 0,
  assists: 0,
  cleanSheets: 0,
  goalsConceded: 0,
}

const CLEAN_SHEET_ELEMENT_TYPES = new Set([GOALKEEPER_ELEMENT_TYPE, DEFENDER_ELEMENT_TYPE])
const MINUTES_STAT = "minutes"
const BPS_STAT = "bps"

const countsCleanSheets = (elementType: number | undefined): boolean =>
  elementType !== undefined && CLEAN_SHEET_ELEMENT_TYPES.has(elementType)

const minutesIn = ([stats]: EventLiveExplainEntry): number =>
  (stats ?? []).find((stat) => stat.stat === MINUTES_STAT)?.value ?? 0

const concededByElementIn = (fixture: EventLiveFixture): Map<number, number> => {
  const sides = fixture.stats?.find((stat) => stat.s === BPS_STAT)

  return new Map([
    ...(sides?.h ?? []).map((player) => [player.element, fixture.team_a_score ?? 0] as const),
    ...(sides?.a ?? []).map((player) => [player.element, fixture.team_h_score ?? 0] as const),
  ])
}

const concededByTeamIn = (fixture: EventLiveFixture, teamId: number | undefined): number => {
  if (teamId === fixture.team_h) return fixture.team_a_score ?? 0
  if (teamId === fixture.team_a) return fixture.team_h_score ?? 0
  return 0
}

const teamConcededLookup = (fixtures: EventLiveFixture[]): TeamConcededFor => {
  const playedFixtures = new Map<number, PlayedFixture>(
    fixtures.map((fixture) => [
      fixture.id,
      { fixture, concededByElement: concededByElementIn(fixture) },
    ]),
  )

  return (elementId, teamId, explain) =>
    explain
      .filter((entry) => minutesIn(entry) > 0)
      .reduce((conceded, [, fixtureId]) => {
        const played = playedFixtures.get(fixtureId)
        if (!played) return conceded
        return (
          conceded +
          (played.concededByElement.get(elementId) ?? concededByTeamIn(played.fixture, teamId))
        )
      }, 0)
}

const addReturns = (total: GameweekReturns, scored: GameweekReturns): GameweekReturns => ({
  goals: total.goals + scored.goals,
  assists: total.assists + scored.assists,
  cleanSheets: total.cleanSheets + scored.cleanSheets,
  goalsConceded: total.goalsConceded + scored.goalsConceded,
})

export const liveFixtures = (live: EventLiveResponse | null): EventLiveFixture[] =>
  Array.isArray(live?.fixtures) ? live.fixtures : []

export const liveElementEntries = (live: EventLiveResponse | null): LiveElementEntry[] =>
  Object.entries(live?.elements ?? {}).map(
    ([id, element]) => [Number.parseInt(id, 10), element] as const,
  )

export const buildGameweekReturnsLookups = (
  elements: FplElement[],
  live: EventLiveResponse | null,
): GameweekReturnsLookups => {
  const teamByElement = new Map(elements.map((element) => [element.id, element.team]))
  const typeByElement = new Map(elements.map((element) => [element.id, element.element_type]))
  const teamConcededFor = teamConcededLookup(liveFixtures(live))
  const liveElements = liveElementEntries(live)

  return {
    teamByElement,
    typeByElement,
    minutesByElement: new Map(liveElements.map(([id, element]) => [id, element.stats.minutes])),
    returnsByElement: new Map(
      liveElements.map(([id, element]) => [
        id,
        {
          goals: element.stats.goals_scored,
          assists: element.stats.assists,
          cleanSheets: countsCleanSheets(typeByElement.get(id)) ? element.stats.clean_sheets : 0,
          goalsConceded: teamConcededFor(id, teamByElement.get(id), element.explain ?? []),
        },
      ]),
    ),
  }
}

export const tallyGameweekReturns = (
  elementIds: number[],
  lookups: GameweekReturnsLookups,
): GameweekReturns =>
  elementIds.reduce(
    (total, elementId) =>
      addReturns(total, lookups.returnsByElement.get(elementId) ?? NO_GAMEWEEK_RETURNS),
    NO_GAMEWEEK_RETURNS,
  )

export const officialXiReturns = (
  picks: EntryEventPick[],
  lookups: GameweekReturnsLookups,
): GameweekReturns =>
  tallyGameweekReturns(
    picks.filter((pick) => !isBenchPosition(pick.position)).map((pick) => pick.element),
    lookups,
  )

export const sumSquadLiveReturns = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: GameweekReturnsLookups,
): GameweekReturns =>
  tallyGameweekReturns(
    scoringPicks(picks, progress, lookups).map((pick) => pick.element),
    lookups,
  )
