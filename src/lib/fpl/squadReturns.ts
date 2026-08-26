import type { SquadWeekStats } from "@pbd/lib/fpl/squadWeek"
import { round1 } from "@pbd/lib/utils/fmt"

type SquadReturns = {
  goals: number
  assists: number
  cleanSheets: number
  defconPoints: number
  expectedGoals: number
  expectedAssists: number
}

export const sumSquadReturns = (weeks: SquadWeekStats[]): SquadReturns => ({
  goals: weeks.reduce((sum, week) => sum + week.starterGoals, 0),
  assists: weeks.reduce((sum, week) => sum + week.starterAssists, 0),
  cleanSheets: weeks.reduce((sum, week) => sum + week.starterCleanSheets, 0),
  defconPoints: weeks.reduce((sum, week) => sum + week.starterDefconPoints, 0),
  expectedGoals: round1(weeks.reduce((sum, week) => sum + week.starterExpectedGoals, 0)),
  expectedAssists: round1(weeks.reduce((sum, week) => sum + week.starterExpectedAssists, 0)),
})
