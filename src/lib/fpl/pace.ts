import { round1 } from "@pbd/lib/utils/fmt"

type PaceEntryInput = {
  entryApiId: number
  rows: { points: number }[]
}

type PaceRow = {
  entryApiId: number
  totalPoints: number
  ppg: number
  projectedTotal: number
  gapToTopPace: number
}

export const computePaceRows = (entries: PaceEntryInput[], stopEvent: number): PaceRow[] => {
  const projections = entries.map((entry) => {
    const totalPoints = entry.rows.reduce((sum, row) => sum + row.points, 0)
    const played = entry.rows.length
    const ppg = played === 0 ? 0 : totalPoints / played
    return {
      entryApiId: entry.entryApiId,
      totalPoints,
      ppg,
      projectedTotal: Math.round(ppg * stopEvent),
    }
  })
  const topProjected = projections.reduce((max, row) => Math.max(max, row.projectedTotal), 0)

  return projections.map((row) => ({
    entryApiId: row.entryApiId,
    totalPoints: row.totalPoints,
    ppg: round1(row.ppg),
    projectedTotal: row.projectedTotal,
    gapToTopPace: topProjected - row.projectedTotal,
  }))
}
