"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useBenchTable } from "@pbd/hooks/fpl/useBenchTable"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

export const BenchTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useBenchTable({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => b.benchTotal - a.benchTotal)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: `${row.benchTotal}`, label: "Wasted" },
      detail:
        row.worstEvent === 0
          ? `${row.efficiencyPct}% efficient`
          : `${row.efficiencyPct}% efficient · worst GW${row.worstEvent} (${row.worstPoints})`,
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="Bench waste appears once the first gameweek is complete."
    />
  )
}
