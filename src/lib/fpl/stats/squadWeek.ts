import type { EventLiveExplainEntry } from "@pbd/types/fpl.types"

export type SquadWeekStats = {
  event: number
  benchPoints: number
  starterGoals: number
  starterAssists: number
  starterCleanSheets: number
  starterDefconPoints: number
  starterExpectedGoals: number
  starterExpectedAssists: number
}

type SquadWeekPick = { element: number; position: number }

export type SquadWeekElement = {
  stats: {
    total_points: number
    goals_scored: number
    assists: number
    expected_goals: number
    expected_assists: number
  }
  explain?: EventLiveExplainEntry[]
}

type PointsAwarded = { cleanSheets: number; defconPoints: number }

const BENCH_START_POSITION = 12
const CLEAN_SHEET_STAT = "clean_sheets"
const DEFCON_STAT = "defensive_contribution"

export const isBenchPosition = (position: number): boolean => position >= BENCH_START_POSITION

export const awardedFromExplain = (explain: EventLiveExplainEntry[] | undefined): PointsAwarded => {
  const awarded: PointsAwarded = { cleanSheets: 0, defconPoints: 0 }
  for (const fixture of explain ?? []) {
    for (const item of fixture[0] ?? []) {
      if (item.stat === CLEAN_SHEET_STAT) awarded.cleanSheets += item.value
      if (item.stat === DEFCON_STAT) awarded.defconPoints += item.points
    }
  }
  return awarded
}

export const summariseSquadWeek = (
  event: number,
  picks: SquadWeekPick[],
  elementFor: (elementId: number) => SquadWeekElement | undefined,
): SquadWeekStats => {
  const week: SquadWeekStats = {
    event,
    benchPoints: 0,
    starterGoals: 0,
    starterAssists: 0,
    starterCleanSheets: 0,
    starterDefconPoints: 0,
    starterExpectedGoals: 0,
    starterExpectedAssists: 0,
  }

  for (const pick of picks) {
    const element = elementFor(pick.element)
    if (!element) continue
    if (isBenchPosition(pick.position)) {
      week.benchPoints += element.stats.total_points
      continue
    }
    const awarded = awardedFromExplain(element.explain)
    week.starterGoals += element.stats.goals_scored
    week.starterAssists += element.stats.assists
    week.starterCleanSheets += awarded.cleanSheets
    week.starterDefconPoints += awarded.defconPoints
    week.starterExpectedGoals += element.stats.expected_goals
    week.starterExpectedAssists += element.stats.expected_assists
  }

  return week
}
