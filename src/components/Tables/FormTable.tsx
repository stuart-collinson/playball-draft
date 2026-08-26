"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useFormTable } from "@pbd/hooks/fpl/useFormTable"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

export const FormTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useFormTable({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => b.formPoints - a.formPoints)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: `${row.formPoints}`, label: `Last ${row.played}` },
      detail: `W ${row.wins} · D ${row.draws} · L ${row.losses} · Average ${row.formAvg}`,
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="Form appears once the first gameweek is complete."
    />
  )
}
