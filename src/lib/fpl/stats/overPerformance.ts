import { round1 } from "@pbd/lib/format"

type SquadReturnTotals = {
  goals: number
  assists: number
  expectedGoals: number
  expectedAssists: number
}

type OverPerformance = {
  involvements: number
  expectedInvolvements: number
  difference: number
  differencePct: number | null
}

const PERCENT = 100

export const computeOverPerformance = (totals: SquadReturnTotals): OverPerformance => {
  const involvements = totals.goals + totals.assists
  const expectedInvolvements = round1(totals.expectedGoals + totals.expectedAssists)
  const difference = round1(involvements - expectedInvolvements)

  return {
    involvements,
    expectedInvolvements,
    difference,
    differencePct:
      expectedInvolvements > 0 ? Math.round((difference / expectedInvolvements) * PERCENT) : null,
  }
}
