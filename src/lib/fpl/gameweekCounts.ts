type GameweekScore = {
  entryApiId: number
  leagueId: number
  event: number
  points: number
}

type GameweekCount = {
  entryApiId: number
  gwWins: number
  gwLosses: number
}

export const computeGameweekCounts = (scores: GameweekScore[]): GameweekCount[] => {
  const byLeagueEvent = new Map<string, GameweekScore[]>()
  for (const score of scores) {
    const key = `${score.leagueId}-${score.event}`
    const group = byLeagueEvent.get(key) ?? []
    group.push(score)
    byLeagueEvent.set(key, group)
  }

  const wins = new Map<number, number>()
  const losses = new Map<number, number>()
  for (const group of byLeagueEvent.values()) {
    const points = group.map((score) => score.points)
    const max = Math.max(...points)
    const min = Math.min(...points)
    for (const score of group) {
      if (score.points === max) wins.set(score.entryApiId, (wins.get(score.entryApiId) ?? 0) + 1)
      if (score.points === min)
        losses.set(score.entryApiId, (losses.get(score.entryApiId) ?? 0) + 1)
    }
  }

  const entryApiIds = [...new Set(scores.map((score) => score.entryApiId))]
  return entryApiIds.map((entryApiId) => ({
    entryApiId,
    gwWins: wins.get(entryApiId) ?? 0,
    gwLosses: losses.get(entryApiId) ?? 0,
  }))
}
