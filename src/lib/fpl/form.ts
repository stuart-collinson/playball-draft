import type { RoundRobinEntryInput } from "@pbd/lib/fpl/roundRobin"
import { computeRoundRobinTable } from "@pbd/lib/fpl/roundRobin"
import { round1 } from "@pbd/lib/utils/fmt"

type FormRow = {
  entryApiId: number
  leagueId: number
  formPoints: number
  formAvg: number
  wins: number
  draws: number
  losses: number
  played: number
}

export const computeFormTable = (entries: RoundRobinEntryInput[], window: number): FormRow[] => {
  const recent = entries.map((entry) => ({
    ...entry,
    rows: [...entry.rows].sort((a, b) => a.event - b.event).slice(-window),
  }))
  const playedByEntry = new Map(recent.map((entry) => [entry.entryApiId, entry.rows.length]))

  return computeRoundRobinTable(recent).map((row) => {
    const played = playedByEntry.get(row.entryApiId) ?? 0
    return {
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      formPoints: row.totalPoints,
      formAvg: played === 0 ? 0 : round1(row.totalPoints / played),
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      played,
    }
  })
}
