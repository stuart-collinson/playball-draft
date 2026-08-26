import { round1 } from "@pbd/lib/utils/fmt"

export type ScoreDistribution = {
  average: number
  stdDev: number
  floor: number
  ceiling: number
  over50: number
  over60: number
  over70: number
}

const FLOOR_PERCENTILE = 0.1
const CEILING_PERCENTILE = 0.9
const THRESHOLD_LOW = 50
const THRESHOLD_MID = 60
const THRESHOLD_HIGH = 70

const percentile = (sorted: number[], fraction: number): number => {
  const last = sorted.length - 1
  if (last < 0) return 0
  const index = last * fraction
  const lowerIndex = Math.floor(index)
  const lowerValue = sorted[lowerIndex] ?? 0
  const upperValue = sorted[Math.ceil(index)] ?? lowerValue
  return lowerValue + (upperValue - lowerValue) * (index - lowerIndex)
}

export const computeScoreDistribution = (points: number[]): ScoreDistribution => {
  if (points.length === 0)
    return { average: 0, stdDev: 0, floor: 0, ceiling: 0, over50: 0, over60: 0, over70: 0 }

  const average = points.reduce((sum, p) => sum + p, 0) / points.length
  const variance = points.reduce((sum, p) => sum + (p - average) ** 2, 0) / points.length
  const sorted = [...points].sort((a, b) => a - b)

  return {
    average: round1(average),
    stdDev: round1(Math.sqrt(variance)),
    floor: round1(percentile(sorted, FLOOR_PERCENTILE)),
    ceiling: round1(percentile(sorted, CEILING_PERCENTILE)),
    over50: points.filter((p) => p >= THRESHOLD_LOW).length,
    over60: points.filter((p) => p >= THRESHOLD_MID).length,
    over70: points.filter((p) => p >= THRESHOLD_HIGH).length,
  }
}
