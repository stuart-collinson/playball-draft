import type { EntryEventPick, EventLiveResponse, FplElement, FplTeam } from "@pbd/types/fpl.types"
import type { PitchFlag, PitchRow } from "@pbd/types/pitch.types"

const LAST_STARTER_POSITION = 11

const POSITION_ROW_ORDER = [1, 2, 3, 4] as const

const AVAILABLE_STATUS = "a"

const DOUBTFUL_STATUS = "d"

const AMBER_CHANCE_MIN = 50

export const availabilityFlag = (element: FplElement | undefined): PitchFlag | undefined => {
  if (!element || element.status === AVAILABLE_STATUS) return undefined
  if (
    element.status === DOUBTFUL_STATUS &&
    (element.chance_of_playing_next_round ?? 0) >= AMBER_CHANCE_MIN
  )
    return "amber"
  return "red"
}

export const livePointsFor = (live: EventLiveResponse | null, elementId: number): number =>
  live?.elements[String(elementId)]?.stats.total_points ?? 0

export const buildStarterRows = (
  picks: EntryEventPick[],
  elements: FplElement[],
  teams: FplTeam[],
  pointsFor: (elementId: number) => string,
): PitchRow[] => {
  const elementById = new Map(elements.map((element) => [element.id, element]))
  const clubByTeamId = new Map(teams.map((team) => [team.id, team.short_name]))

  const starters = picks
    .filter((pick) => pick.position <= LAST_STARTER_POSITION)
    .sort((first, second) => first.position - second.position)

  return POSITION_ROW_ORDER.flatMap((elementType) => {
    const players = starters
      .filter((pick) => elementById.get(pick.element)?.element_type === elementType)
      .map((pick) => {
        const element = elementById.get(pick.element)

        return {
          key: String(pick.element),
          name: element?.web_name ?? "?",
          club: element ? clubByTeamId.get(element.team) : undefined,
          value: pointsFor(pick.element),
          flag: availabilityFlag(element),
        }
      })

    return players.length > 0 ? [{ key: String(elementType), players }] : []
  })
}
