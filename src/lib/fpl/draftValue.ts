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

export type DraftValueRow = DraftPickInput & { pointsRank: number; valueScore: number }

export type DraftRoundWinner = { leagueId: number; round: number; pick: DraftPickInput }

export type DraftReachRow = DraftPickInput & { reachDelta: number }

const byLeague = (picks: DraftPickInput[]): Map<number, DraftPickInput[]> => {
  const groups = new Map<number, DraftPickInput[]>()
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

export const computeDraftValue = (picks: DraftPickInput[]): DraftValueRow[] => {
  const rows: DraftValueRow[] = []
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

export const computeRoundWinners = (picks: DraftPickInput[]): DraftRoundWinner[] => {
  const winners: DraftRoundWinner[] = []
  for (const [leagueId, group] of byLeague(picks)) {
    const rounds = new Map<number, DraftPickInput>()
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

export const computeReachRows = (picks: DraftPickInput[]): DraftReachRow[] =>
  picks
    .map((pick) => ({ ...pick, reachDelta: pick.draftRank - pick.pickNumber }))
    .sort((a, b) => b.reachDelta - a.reachDelta)
