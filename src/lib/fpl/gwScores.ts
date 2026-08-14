import type { EntryHistoryResponse } from "@pbd/types/fpl.types"

export type GwScore = {
  apiId: number
  event: number
  points: number
  leagueId: number
}

// One score per entry per finished gameweek, from the entry histories fetched
// alongside (aligned by index with the entries).
export const buildGwScores = (
  entries: { id: number; leagueId: number }[],
  histories: (EntryHistoryResponse | undefined)[],
  finishedGwSet: Set<number>,
): GwScore[] =>
  entries.flatMap((entry, index) =>
    (histories[index]?.history ?? [])
      .filter((h) => finishedGwSet.has(h.event))
      .map((h) => ({
        apiId: entry.id,
        event: h.event,
        points: h.points,
        leagueId: entry.leagueId,
      })),
  )

// Gameweek wins and losses per entry, keyed by apiId. Winners are decided
// within each entry's own league (combined views sum per-league wins rather
// than requiring someone to beat both leagues at once), and ties share the
// win or loss rather than picking whoever sorts first.
export const tallyGwExtremes = (
  scores: GwScore[],
): { wins: Map<number, number>; lasts: Map<number, number> } => {
  const byLeagueEvent = new Map<string, GwScore[]>()
  for (const score of scores) {
    const key = `${score.leagueId}-${score.event}`
    const group = byLeagueEvent.get(key)
    if (group) group.push(score)
    else byLeagueEvent.set(key, [score])
  }

  const wins = new Map<number, number>()
  const lasts = new Map<number, number>()
  for (const group of byLeagueEvent.values()) {
    const max = Math.max(...group.map((score) => score.points))
    const min = Math.min(...group.map((score) => score.points))
    for (const score of group) {
      if (score.points === max) wins.set(score.apiId, (wins.get(score.apiId) ?? 0) + 1)
      if (score.points === min) lasts.set(score.apiId, (lasts.get(score.apiId) ?? 0) + 1)
    }
  }

  return { wins, lasts }
}
