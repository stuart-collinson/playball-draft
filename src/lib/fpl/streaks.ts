import type { RoundRobinEntryInput } from "@pbd/lib/fpl/roundRobin"

export type StreakState = "hot" | "cold" | "none"

export type StreakRow = {
  entryApiId: number
  leagueId: number
  current: { type: StreakState; length: number }
  longestHot: number
  longestCold: number
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const upper = sorted[middle] ?? 0
  if (sorted.length % 2 === 1) return upper
  const lower = sorted[middle - 1] ?? upper
  return (lower + upper) / 2
}

export const computeStreaks = (entries: RoundRobinEntryInput[]): StreakRow[] => {
  const byLeague = new Map<number, RoundRobinEntryInput[]>()
  for (const entry of entries) {
    const group = byLeague.get(entry.leagueId) ?? []
    group.push(entry)
    byLeague.set(entry.leagueId, group)
  }

  const rows: StreakRow[] = []

  for (const [leagueId, group] of byLeague) {
    const pointsByEvent = new Map<number, number[]>()
    for (const entry of group) {
      for (const row of entry.rows) {
        const scores = pointsByEvent.get(row.event) ?? []
        scores.push(row.points)
        pointsByEvent.set(row.event, scores)
      }
    }
    const medians = new Map(
      [...pointsByEvent.entries()].map(([event, scores]) => [event, median(scores)]),
    )

    for (const entry of group) {
      const ordered = [...entry.rows].sort((a, b) => a.event - b.event)
      let currentType: StreakState = "none"
      let currentLength = 0
      let longestHot = 0
      let longestCold = 0

      for (const row of ordered) {
        const eventMedian = medians.get(row.event) ?? 0
        const state: StreakState =
          row.points > eventMedian ? "hot" : row.points < eventMedian ? "cold" : "none"

        if (state === "none") {
          currentType = "none"
          currentLength = 0
          continue
        }
        if (state === currentType) currentLength++
        else {
          currentType = state
          currentLength = 1
        }
        if (currentType === "hot") longestHot = Math.max(longestHot, currentLength)
        if (currentType === "cold") longestCold = Math.max(longestCold, currentLength)
      }

      rows.push({
        entryApiId: entry.entryApiId,
        leagueId,
        current: { type: currentType, length: currentLength },
        longestHot,
        longestCold,
      })
    }
  }

  return rows
}
