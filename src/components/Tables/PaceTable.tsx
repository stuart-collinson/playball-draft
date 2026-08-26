"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { usePaceTable } from "@pbd/hooks/fpl/usePaceTable"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

export const PaceTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = usePaceTable({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => b.projectedTotal - a.projectedTotal)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: fmtPts(row.projectedTotal), label: "Projected" },
      detail:
        row.gapToTopPace === 0
          ? `${row.ppg} ppg · setting the pace`
          : `${row.ppg} ppg · ${row.gapToTopPace} off the pace`,
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="Projections appear once the first gameweek is complete."
    />
  )
}
