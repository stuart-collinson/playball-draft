import type { GameweekVerdict } from "@pbd/lib/fpl/gameweekVerdicts"

export type RecordsEntryInput = {
  entryApiId: number
  leagueId: number
  rows: { event: number; points: number; pointsOnBench: number }[]
}

export type RecordKey =
  | "biggest-margin"
  | "closest-call"
  | "best-non-winner"
  | "lowest-winner"
  | "biggest-bench-waste"

export type RecordHolder = { entryApiId: number; event: number; points: number }

export type LeagueRecordEntry = {
  key: RecordKey
  leagueId: number
  value: number
  holders: RecordHolder[]
}

type Extreme = { value: number; holders: RecordHolder[] }

const better = (candidate: number, current: Extreme | null, direction: "max" | "min"): boolean =>
  current === null || (direction === "max" ? candidate > current.value : candidate < current.value)

const track = (
  current: Extreme | null,
  candidate: number,
  holder: RecordHolder | null,
  direction: "max" | "min",
): Extreme => {
  if (better(candidate, current, direction))
    return { value: candidate, holders: holder ? [holder] : [] }
  if (current && candidate === current.value && holder) current.holders.push(holder)
  return current ?? { value: candidate, holders: holder ? [holder] : [] }
}

const toHolder = (score: { entryApiId: number; points: number }, event: number): RecordHolder => ({
  entryApiId: score.entryApiId,
  event,
  points: score.points,
})

export const computeLeagueRecords = (
  entries: RecordsEntryInput[],
  verdicts: GameweekVerdict[],
): LeagueRecordEntry[] => {
  const winners = new Map(
    verdicts.map((verdict) => [`${verdict.leagueId}-${verdict.event}`, verdict.winnerApiId]),
  )
  const byLeague = new Map<number, RecordsEntryInput[]>()
  for (const entry of entries) {
    const group = byLeague.get(entry.leagueId) ?? []
    group.push(entry)
    byLeague.set(entry.leagueId, group)
  }

  const records: LeagueRecordEntry[] = []

  for (const [leagueId, group] of byLeague) {
    const byEvent = new Map<number, { entryApiId: number; points: number }[]>()
    for (const entry of group) {
      for (const row of entry.rows) {
        const scores = byEvent.get(row.event) ?? []
        scores.push({ entryApiId: entry.entryApiId, points: row.points })
        byEvent.set(row.event, scores)
      }
    }

    let margin: Extreme | null = null
    let closest: Extreme | null = null
    let bestNonWinner: Extreme | null = null
    let lowestWinner: Extreme | null = null
    let benchWaste: Extreme | null = null

    for (const [event, scores] of byEvent) {
      const winnerApiId = winners.get(`${leagueId}-${event}`)
      const winner = scores.find((score) => score.entryApiId === winnerApiId)
      const others = scores
        .filter((score) => score.entryApiId !== winnerApiId)
        .sort((a, b) => b.points - a.points)
      const second = others[0]
      if (!winner || !second) continue

      const gap = winner.points - second.points
      margin = track(margin, gap, toHolder(winner, event), "max")
      lowestWinner = track(lowestWinner, winner.points, toHolder(winner, event), "min")

      for (const runner of others.filter((score) => score.points === second.points)) {
        closest = track(closest, gap, toHolder(runner, event), "min")
      }

      for (const score of others) {
        bestNonWinner = track(bestNonWinner, score.points, toHolder(score, event), "max")
      }
    }

    for (const entry of group) {
      for (const row of entry.rows) {
        if (row.pointsOnBench <= 0) continue
        benchWaste = track(
          benchWaste,
          row.pointsOnBench,
          { entryApiId: entry.entryApiId, event: row.event, points: row.pointsOnBench },
          "max",
        )
      }
    }

    const push = (key: RecordKey, extreme: Extreme | null): void => {
      if (extreme) records.push({ key, leagueId, value: extreme.value, holders: extreme.holders })
    }
    push("biggest-margin", margin)
    push("closest-call", closest)
    push("best-non-winner", bestNonWinner)
    push("lowest-winner", lowestWinner)
    push("biggest-bench-waste", benchWaste)
  }

  return records
}

export const pickRecordExtreme = (
  records: LeagueRecordEntry[],
  key: RecordKey,
  direction: "max" | "min",
): LeagueRecordEntry | null =>
  records
    .filter((record) => record.key === key)
    .reduce<LeagueRecordEntry | null>(
      (best, record) =>
        best === null ||
        (direction === "max" ? record.value > best.value : record.value < best.value)
          ? record
          : best,
      null,
    )
