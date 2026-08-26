import { round1 } from "@pbd/lib/utils/fmt"

export type ScoreDistribution = {
  average: number
  stdDev: number
  over50: number
  over60: number
  over70: number
}

const THRESHOLD_LOW = 50
const THRESHOLD_MID = 60
const THRESHOLD_HIGH = 70

export const computeScoreDistribution = (points: number[]): ScoreDistribution => {
  if (points.length === 0) return { average: 0, stdDev: 0, over50: 0, over60: 0, over70: 0 }

  const average = points.reduce((sum, p) => sum + p, 0) / points.length
  const variance = points.reduce((sum, p) => sum + (p - average) ** 2, 0) / points.length

  return {
    average: round1(average),
    stdDev: round1(Math.sqrt(variance)),
    over50: points.filter((p) => p >= THRESHOLD_LOW).length,
    over60: points.filter((p) => p >= THRESHOLD_MID).length,
    over70: points.filter((p) => p >= THRESHOLD_HIGH).length,
  }
}
