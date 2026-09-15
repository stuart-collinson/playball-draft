"use client"

import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import { useGwLeaderboard } from "@pbd/hooks/fpl/useGwLeaderboard"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  type: "best" | "worst"
}

const COLUMNS: ManagerTableColumn[] = [
  { key: "gameweek", header: "GW", align: "center", emphasis: "muted", className: "w-12" },
  { key: "points", header: "Pts", className: "w-14" },
]

export const GwLeaderboardTable = ({ leagueIds, type }: Props): JSX.Element => {
  const { data } = useGwLeaderboard({ leagueIds, type })

  const rows: ManagerTableRow[] = data.map((entry) => ({
    key: `${entry.entryApiId}-${entry.event}`,
    rank: entry.rank,
    entryApiId: entry.entryApiId,
    leagueId: entry.leagueId,
    managerName: entry.managerName,
    teamName: entry.teamName,
    cells: { gameweek: entry.event, points: entry.points },
  }))

  return (
    <ManagerTable
      columns={COLUMNS}
      rows={rows}
      showFaces
      emptyTitle="No Gameweek Scores Yet"
      emptyMessage="Scores appear once the first gameweek is complete."
    />
  )
}
