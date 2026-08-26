export type StandingsHistoryEntry = {
  entryApiId: number
  leagueId: number
  totalsByEvent: Map<number, number>
}

export type StandingsHistoryPoint = {
  event: number
  position: number
  totalPoints: number
}

export type StandingsHistoryRow = {
  entryApiId: number
  leagueId: number
  history: StandingsHistoryPoint[]
}

export const computeStandingsHistory = (
  entries: StandingsHistoryEntry[],
  finishedEvents: number[],
): StandingsHistoryRow[] => {
  const events = [...finishedEvents].sort((a, b) => a - b)
  const rows: StandingsHistoryRow[] = entries.map((entry) => ({
    entryApiId: entry.entryApiId,
    leagueId: entry.leagueId,
    history: events.map((event) => ({
      event,
      position: 0,
      totalPoints: entry.totalsByEvent.get(event) ?? 0,
    })),
  }))

  const leagueIds = [...new Set(entries.map((entry) => entry.leagueId))]
  for (const leagueId of leagueIds) {
    const leagueRows = rows.filter((row) => row.leagueId === leagueId)
    for (let index = 0; index < events.length; index++) {
      const ordered = [...leagueRows].sort(
        (a, b) =>
          (b.history[index]?.totalPoints ?? 0) - (a.history[index]?.totalPoints ?? 0) ||
          a.entryApiId - b.entryApiId,
      )
      ordered.forEach((row, rank) => {
        const point = row.history[index]
        if (point) point.position = rank + 1
      })
    }
  }

  return rows
}
