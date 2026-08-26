import { round1 } from "@pbd/lib/utils/fmt"

export type AllPlayEntryInput = {
  entryApiId: number
  leagueId: number
  rows: { event: number; points: number }[]
}

export type AllPlayTableRow = {
  entryApiId: number
  leagueId: number
  wins: number
  draws: number
  losses: number
  winPct: number
  totalPoints: number
  actualRank: number
  allPlayRank: number
  luckDelta: number
}

export type PairwiseCell = { wins: number; draws: number; losses: number }

export type PairwiseGrid = {
  leagueId: number
  order: number[]
  cells: PairwiseCell[][]
}

export type RivalExtreme = {
  entryApiId: number
  nemesisApiId: number | null
  nemesisRecord: PairwiseCell | null
  bunnyApiId: number | null
  bunnyRecord: PairwiseCell | null
}

type Tally = { wins: number; draws: number; losses: number }

type Rival = { apiId: number; cell: PairwiseCell; net: number }

const HALF_WIN = 0.5
const PCT = 100

const groupByLeague = (entries: AllPlayEntryInput[]): Map<number, AllPlayEntryInput[]> => {
  const byLeague = new Map<number, AllPlayEntryInput[]>()
  for (const entry of entries) {
    const group = byLeague.get(entry.leagueId) ?? []
    group.push(entry)
    byLeague.set(entry.leagueId, group)
  }
  return byLeague
}

const eventScores = (
  group: AllPlayEntryInput[],
): Map<number, { entryApiId: number; points: number }[]> => {
  const byEvent = new Map<number, { entryApiId: number; points: number }[]>()
  for (const entry of group) {
    for (const row of entry.rows) {
      const scores = byEvent.get(row.event) ?? []
      scores.push({ entryApiId: entry.entryApiId, points: row.points })
      byEvent.set(row.event, scores)
    }
  }
  return byEvent
}

export const computeAllPlayTable = (entries: AllPlayEntryInput[]): AllPlayTableRow[] => {
  const rows: AllPlayTableRow[] = []

  for (const [leagueId, group] of groupByLeague(entries)) {
    const tallies = new Map<number, Tally>(
      group.map((entry) => [entry.entryApiId, { wins: 0, draws: 0, losses: 0 }]),
    )

    for (const scores of eventScores(group).values()) {
      for (const score of scores) {
        const tally = tallies.get(score.entryApiId)
        if (!tally) continue
        for (const opponent of scores) {
          if (opponent.entryApiId === score.entryApiId) continue
          if (score.points > opponent.points) tally.wins++
          else if (score.points < opponent.points) tally.losses++
          else tally.draws++
        }
      }
    }

    const totals = new Map(
      group.map((entry) => [
        entry.entryApiId,
        entry.rows.reduce((sum, row) => sum + row.points, 0),
      ]),
    )

    const winPcts = new Map(
      group.map((entry) => {
        const tally = tallies.get(entry.entryApiId) ?? { wins: 0, draws: 0, losses: 0 }
        const games = tally.wins + tally.draws + tally.losses
        const pct = games === 0 ? 0 : ((tally.wins + tally.draws * HALF_WIN) / games) * PCT
        return [entry.entryApiId, pct]
      }),
    )

    const actualOrder = [...group].sort(
      (a, b) =>
        (totals.get(b.entryApiId) ?? 0) - (totals.get(a.entryApiId) ?? 0) ||
        a.entryApiId - b.entryApiId,
    )
    const actualRanks = new Map(actualOrder.map((entry, index) => [entry.entryApiId, index + 1]))

    const allPlayOrder = [...group].sort(
      (a, b) =>
        (winPcts.get(b.entryApiId) ?? 0) - (winPcts.get(a.entryApiId) ?? 0) ||
        (totals.get(b.entryApiId) ?? 0) - (totals.get(a.entryApiId) ?? 0) ||
        a.entryApiId - b.entryApiId,
    )
    const allPlayRanks = new Map(allPlayOrder.map((entry, index) => [entry.entryApiId, index + 1]))

    for (const entry of group) {
      const tally = tallies.get(entry.entryApiId) ?? { wins: 0, draws: 0, losses: 0 }
      const actualRank = actualRanks.get(entry.entryApiId) ?? 0
      const allPlayRank = allPlayRanks.get(entry.entryApiId) ?? 0
      rows.push({
        entryApiId: entry.entryApiId,
        leagueId,
        wins: tally.wins,
        draws: tally.draws,
        losses: tally.losses,
        winPct: round1(winPcts.get(entry.entryApiId) ?? 0),
        totalPoints: totals.get(entry.entryApiId) ?? 0,
        actualRank,
        allPlayRank,
        luckDelta: allPlayRank - actualRank,
      })
    }
  }

  return rows
}

export const computePairwiseGrids = (entries: AllPlayEntryInput[]): PairwiseGrid[] => {
  const table = computeAllPlayTable(entries)
  const grids: PairwiseGrid[] = []

  for (const [leagueId, group] of groupByLeague(entries)) {
    const order = table
      .filter((row) => row.leagueId === leagueId)
      .sort((a, b) => a.allPlayRank - b.allPlayRank)
      .map((row) => row.entryApiId)

    const pointsByEntryEvent = new Map<number, Map<number, number>>(
      group.map((entry) => [
        entry.entryApiId,
        new Map(entry.rows.map((row) => [row.event, row.points])),
      ]),
    )
    const events = [...new Set(group.flatMap((entry) => entry.rows.map((row) => row.event)))]

    const cells = order.map((rowId) =>
      order.map((colId) => {
        const cell: PairwiseCell = { wins: 0, draws: 0, losses: 0 }
        if (rowId === colId) return cell
        for (const event of events) {
          const own = pointsByEntryEvent.get(rowId)?.get(event)
          const theirs = pointsByEntryEvent.get(colId)?.get(event)
          if (own === undefined || theirs === undefined) continue
          if (own > theirs) cell.wins++
          else if (own < theirs) cell.losses++
          else cell.draws++
        }
        return cell
      }),
    )

    grids.push({ leagueId, order, cells })
  }

  return grids
}

export const computeRivalExtremes = (grid: PairwiseGrid): RivalExtreme[] =>
  grid.order.map((entryApiId, rowIndex) => {
    let nemesis: Rival | null = null
    let bunny: Rival | null = null

    for (const [colIndex, opponentApiId] of grid.order.entries()) {
      if (opponentApiId === entryApiId) continue
      const cell = grid.cells[rowIndex]?.[colIndex]
      if (!cell) continue
      const net = cell.wins - cell.losses
      if (!nemesis || net < nemesis.net) nemesis = { apiId: opponentApiId, cell, net }
      if (!bunny || net > bunny.net) bunny = { apiId: opponentApiId, cell, net }
    }

    return {
      entryApiId,
      nemesisApiId: nemesis ? nemesis.apiId : null,
      nemesisRecord: nemesis ? nemesis.cell : null,
      bunnyApiId: bunny ? bunny.apiId : null,
      bunnyRecord: bunny ? bunny.cell : null,
    }
  })
