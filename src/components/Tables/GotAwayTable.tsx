"use client"

import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import { PlayerLabel } from "@pbd/components/PlayerLabel/PlayerLabel"
import { useGotAway } from "@pbd/hooks/fpl/useGotAway"
import { fmtPts } from "@pbd/lib/format"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const COLUMNS: ManagerTableColumn[] = [{ key: "since", header: "Since", className: "w-14" }]

export const GotAwayTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useGotAway({ leagueIds })

  const rows: ManagerTableRow[] = data.map((row, index) => ({
    key: `${row.leagueId}-${row.elementId}-${row.droppedEvent}-${row.entryApiId}`,
    rank: index + 1,
    entryApiId: row.entryApiId,
    leagueId: row.leagueId,
    managerName: row.managerName,
    title: <PlayerLabel name={row.playerName} club={row.playerTeam} />,
    subtitle: `Dropped by ${row.managerName} · GW${row.droppedEvent}`,
    cells: { since: fmtPts(row.pointsSince) },
  }))

  return (
    <ManagerTable
      columns={COLUMNS}
      rows={rows}
      emptyTitle="Nothing Got Away Yet"
      emptyMessage="Dropped players start haunting their old managers after the next gameweek."
    />
  )
}
