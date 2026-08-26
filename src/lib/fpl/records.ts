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

export const computeLeagueRecords = (entries: RecordsEntryInput[]): LeagueRecordEntry[] => {
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
      if (scores.length < 2) continue
      const sorted = [...scores].sort((a, b) => b.points - a.points)
      const top = sorted[0]
      const second = sorted[1]
      if (!top || !second) continue

      const topScorers = sorted.filter((s) => s.points === top.points)
      const gap = top.points - second.points

      for (const winner of topScorers) {
        const holder = { entryApiId: winner.entryApiId, event, points: winner.points }
        margin = track(margin, gap, holder, "max")
        lowestWinner = track(lowestWinner, winner.points, holder, "min")
      }

      const runnersUp = sorted.filter((s) => s.points === second.points && s.points < top.points)
      for (const runner of runnersUp) {
        closest = track(
          closest,
          gap,
          { entryApiId: runner.entryApiId, event, points: runner.points },
          "min",
        )
      }
      if (runnersUp.length === 0)
        closest = track(
          closest,
          0,
          { entryApiId: second.entryApiId, event, points: second.points },
          "min",
        )

      for (const score of sorted) {
        if (score.points === top.points) continue
        bestNonWinner = track(
          bestNonWinner,
          score.points,
          { entryApiId: score.entryApiId, event, points: score.points },
          "max",
        )
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
