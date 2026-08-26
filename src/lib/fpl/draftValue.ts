import { round1 } from "@pbd/lib/utils/fmt"

export type DraftPickInput = {
  leagueId: number
  round: number
  pickNumber: number
  entryApiId: number
  elementId: number
  seasonPoints: number
  draftRank: number
}

export type DraftGrade = {
  entryApiId: number
  leagueId: number
  totalPoints: number
  avgPoints: number
  bestPickElementId: number | null
}

export type DraftValueRow<T extends DraftPickInput = DraftPickInput> = T & {
  pointsRank: number
  valueScore: number
}

export type DraftRoundWinner<T extends DraftPickInput = DraftPickInput> = {
  leagueId: number
  round: number
  pick: T
}

export type DraftReachRow<T extends DraftPickInput = DraftPickInput> = T & { reachDelta: number }

const byLeague = <T extends DraftPickInput>(picks: T[]): Map<number, T[]> => {
  const groups = new Map<number, T[]>()
  for (const pick of picks) {
    const group = groups.get(pick.leagueId) ?? []
    group.push(pick)
    groups.set(pick.leagueId, group)
  }
  return groups
}

export const computeDraftGrades = (picks: DraftPickInput[]): DraftGrade[] => {
  const byEntry = new Map<string, DraftPickInput[]>()
  for (const pick of picks) {
    const key = `${pick.leagueId}-${pick.entryApiId}`
    const group = byEntry.get(key) ?? []
    group.push(pick)
    byEntry.set(key, group)
  }
  return [...byEntry.values()].map((group) => {
    const first = group[0]
    const totalPoints = group.reduce((sum, pick) => sum + pick.seasonPoints, 0)
    const best = [...group].sort(
      (a, b) => b.seasonPoints - a.seasonPoints || a.pickNumber - b.pickNumber,
    )[0]
    return {
      entryApiId: first?.entryApiId ?? 0,
      leagueId: first?.leagueId ?? 0,
      totalPoints,
      avgPoints: group.length === 0 ? 0 : round1(totalPoints / group.length),
      bestPickElementId: best ? best.elementId : null,
    }
  })
}

export const computeDraftValue = <T extends DraftPickInput>(picks: T[]): DraftValueRow<T>[] => {
  const rows: DraftValueRow<T>[] = []
  for (const group of byLeague(picks).values()) {
    const ranked = [...group].sort(
      (a, b) =>
        b.seasonPoints - a.seasonPoints || a.pickNumber - b.pickNumber || a.elementId - b.elementId,
    )
    const rankByElement = new Map(ranked.map((pick, index) => [pick.elementId, index + 1]))
    for (const pick of group) {
      const pointsRank = rankByElement.get(pick.elementId) ?? 0
      rows.push({ ...pick, pointsRank, valueScore: pick.pickNumber - pointsRank })
    }
  }
  return rows
}

export const computeRoundWinners = <T extends DraftPickInput>(
  picks: T[],
): DraftRoundWinner<T>[] => {
  const winners: DraftRoundWinner<T>[] = []
  for (const [leagueId, group] of byLeague(picks)) {
    const rounds = new Map<number, T>()
    for (const pick of group) {
      const current = rounds.get(pick.round)
      if (
        !current ||
        pick.seasonPoints > current.seasonPoints ||
        (pick.seasonPoints === current.seasonPoints && pick.pickNumber < current.pickNumber)
      )
        rounds.set(pick.round, pick)
    }
    for (const [round, pick] of rounds) winners.push({ leagueId, round, pick })
  }
  return winners.sort((a, b) => a.leagueId - b.leagueId || a.round - b.round)
}

export const computeReachRows = <T extends DraftPickInput>(picks: T[]): DraftReachRow<T>[] =>
  picks
    .map((pick) => ({ ...pick, reachDelta: pick.draftRank - pick.pickNumber }))
    .sort((a, b) => b.reachDelta - a.reachDelta)
