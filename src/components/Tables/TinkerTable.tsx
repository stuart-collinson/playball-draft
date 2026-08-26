"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useTinkerTable } from "@pbd/hooks/fpl/useTinkerTable"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

export const TinkerTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useTinkerTable({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => b.totalMoves - a.totalMoves)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: `${row.totalMoves}`, label: "Moves" },
      detail:
        row.busiestEvent === 0
          ? `${row.avgPerGw}/gw`
          : `${row.avgPerGw}/gw · busiest GW${row.busiestEvent} (${row.busiestCount})`,
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="Transfer activity appears once the first gameweek is complete."
    />
  )
}
