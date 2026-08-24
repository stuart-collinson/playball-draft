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

const remainingFixturesFor = (
  pick: EntryEventPick,
  progress: FixtureProgress,
  lookups: SquadLookups,
): number => {
  const teamId = lookups.teamByElement.get(pick.element)
  if (!teamId) return 0
  return progress.unfinishedByTeam.get(teamId) ?? 0
}

export const countSquadToPlay = (
  picks: EntryEventPick[],
  progress: FixtureProgress,
  lookups: SquadLookups,
): number => {
  const starters = picks
    .filter((p) => p.position <= LAST_STARTER_POSITION)
    .sort((a, b) => a.position - b.position)
  const bench = picks
    .filter((p) => p.position > LAST_STARTER_POSITION)
    .sort((a, b) => a.position - b.position)
  const benchOutfield = bench.filter(
    (p) => lookups.typeByElement.get(p.element) !== GOALKEEPER_ELEMENT_TYPE,
  )
  const benchGoalkeeper = bench.find(
    (p) => lookups.typeByElement.get(p.element) === GOALKEEPER_ELEMENT_TYPE,
  )

  let toPlay = 0
  let nextOutfieldSubIndex = 0
  let goalkeeperSubUsed = false

  for (const starter of starters) {
    const teamId = lookups.teamByElement.get(starter.element)
    if (!teamId || !progress.teamsWithFixtures.has(teamId)) continue

    const remaining = progress.unfinishedByTeam.get(teamId) ?? 0
    if (remaining > 0) {
      toPlay += remaining
      continue
    }

    if ((lookups.minutesByElement.get(starter.element) ?? 0) > 0) continue

    if (lookups.typeByElement.get(starter.element) === GOALKEEPER_ELEMENT_TYPE) {
      if (goalkeeperSubUsed || !benchGoalkeeper) continue
      goalkeeperSubUsed = true
      toPlay += remainingFixturesFor(benchGoalkeeper, progress, lookups)
      continue
    }

    const sub = benchOutfield[nextOutfieldSubIndex]
    nextOutfieldSubIndex++
    if (sub) toPlay += remainingFixturesFor(sub, progress, lookups)
  }

  return toPlay
}
