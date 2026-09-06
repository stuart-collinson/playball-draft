import type { GameweekVerdict } from "@pbd/lib/fpl/gameweekVerdicts"

type GameweekCount = {
  entryApiId: number
  gwWins: number
  gwLosses: number
}

const tally = (entryApiIds: number[]): Map<number, number> =>
  entryApiIds.reduce(
    (counts, entryApiId) => counts.set(entryApiId, (counts.get(entryApiId) ?? 0) + 1),
    new Map<number, number>(),
  )

export const computeGameweekCounts = (verdicts: GameweekVerdict[]): GameweekCount[] => {
  const wins = tally(verdicts.map((verdict) => verdict.winnerApiId))
  const losses = tally(verdicts.map((verdict) => verdict.loserApiId))
  const entryApiIds = [...new Set(verdicts.flatMap((verdict) => verdict.playerApiIds))]

  return entryApiIds.map((entryApiId) => ({
    entryApiId,
    gwWins: wins.get(entryApiId) ?? 0,
    gwLosses: losses.get(entryApiId) ?? 0,
  }))
}
