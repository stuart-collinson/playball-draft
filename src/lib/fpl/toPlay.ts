import { hasFixtureConcluded } from "@pbd/lib/fpl/fixtures"
import type { EntryEventPick, EventLiveFixture } from "@pbd/types/fpl.types"

const GOALKEEPER_ELEMENT_TYPE = 1
const LAST_STARTER_POSITION = 11

export type FixtureProgress = {
  unfinishedByTeam: Map<number, number>
  teamsWithFixtures: Set<number>
}

export type SquadLookups = {
  teamByElement: Map<number, number>
  typeByElement: Map<number, number>
  minutesByElement: Map<number, number>
}

export type ResolvedStarter = {
  starter: EntryEventPick
  remainingFixtures: number
  substitute: EntryEventPick | null
}

export const buildFixtureProgress = (fixtures: EventLiveFixture[]): FixtureProgress => {
  const unfinishedByTeam = new Map<number, number>()
  const teamsWithFixtures = new Set<number>()

  for (const fixture of fixtures) {
    for (const teamId of [fixture.team_h, fixture.team_a]) {
      teamsWithFixtures.add(teamId)
      if (!hasFixtureConcluded(fixture)) {
        unfinishedByTeam.set(teamId, (unfinishedByTeam.get(teamId) ?? 0) + 1)
      }
    }
  }

  return { unfinishedByTeam, teamsWithFixtures }
}

export const remainingFixturesFor = (
  pick: EntryEventPick,
  progress: FixtureProgress,
  lookups: SquadLookups,
): number => {
  const teamId = lookups.teamByElement.get(pick.element)
  if (!teamId) return 0
  return progress.unfinishedByTeam.get(teamId) ?? 0
}

export const resolveStarters = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: SquadLookups,
): ResolvedStarter[] => {
  const starters = picks
    .filter((pick) => pick.position <= LAST_STARTER_POSITION)
    .sort((first, second) => first.position - second.position)
  const bench = picks
    .filter((pick) => pick.position > LAST_STARTER_POSITION)
    .sort((first, second) => first.position - second.position)
  const benchOutfield = bench.filter(
    (pick) => lookups.typeByElement.get(pick.element) !== GOALKEEPER_ELEMENT_TYPE,
  )
  const benchGoalkeeper = bench.find(
    (pick) => lookups.typeByElement.get(pick.element) === GOALKEEPER_ELEMENT_TYPE,
  )

  const resolved: ResolvedStarter[] = []
  let nextOutfieldSubIndex = 0
  let goalkeeperSubUsed = false

  for (const starter of starters) {
    const teamId = lookups.teamByElement.get(starter.element)
    if (!teamId || !progress.teamsWithFixtures.has(teamId)) continue

    const remainingFixtures = progress.unfinishedByTeam.get(teamId) ?? 0
    if (remainingFixtures > 0) {
      resolved.push({ starter, remainingFixtures, substitute: null })
      continue
    }

    if ((lookups.minutesByElement.get(starter.element) ?? 0) > 0) {
      resolved.push({ starter, remainingFixtures: 0, substitute: null })
      continue
    }

    if (lookups.typeByElement.get(starter.element) === GOALKEEPER_ELEMENT_TYPE) {
      const substitute = goalkeeperSubUsed ? null : (benchGoalkeeper ?? null)
      if (substitute) goalkeeperSubUsed = true
      resolved.push({ starter, remainingFixtures: 0, substitute })
      continue
    }

    const substitute = benchOutfield[nextOutfieldSubIndex] ?? null
    nextOutfieldSubIndex++
    resolved.push({ starter, remainingFixtures: 0, substitute })
  }

  return resolved
}

export const countSquadToPlay = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: SquadLookups,
): number =>
  resolveStarters(picks, progress, lookups).reduce((toPlay, resolved) => {
    if (resolved.remainingFixtures > 0) return toPlay + resolved.remainingFixtures
    if (!resolved.substitute) return toPlay
    return toPlay + remainingFixturesFor(resolved.substitute, progress, lookups)
  }, 0)
