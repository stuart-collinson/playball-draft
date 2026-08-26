import { round1 } from "@pbd/lib/utils/fmt"

export type BenchWeek = { event: number; benchPoints: number }

export type BenchWaste = {
  benchTotal: number
  benchAvg: number
  worstEvent: number
  worstPoints: number
  efficiencyPct: number
}

const FULL_EFFICIENCY_PCT = 100

export const computeBenchWaste = (
  benchWeeks: BenchWeek[],
  startingTotal: number,
  played: number,
): BenchWaste => {
  const benchTotal = benchWeeks.reduce((sum, week) => sum + week.benchPoints, 0)
  const worst = benchWeeks.reduce(
    (acc, week) => (week.benchPoints > acc.benchPoints ? week : acc),
    { event: 0, benchPoints: 0 },
  )
  const squadTotal = startingTotal + benchTotal

  return {
    benchTotal,
    benchAvg: played === 0 ? 0 : round1(benchTotal / played),
    worstEvent: worst.benchPoints === 0 ? 0 : worst.event,
    worstPoints: worst.benchPoints,
    efficiencyPct:
      squadTotal === 0
        ? FULL_EFFICIENCY_PCT
        : round1((startingTotal / squadTotal) * FULL_EFFICIENCY_PCT),
  }
}
