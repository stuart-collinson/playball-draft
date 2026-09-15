import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"

export type ManagerStatRow = {
  rank: number
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  primary: { value: string; label: string }
  detail?: string
}

type Props = {
  rows: ManagerStatRow[]
  emptyTitle: string
  emptyMessage: string
}

const VALUE_COLUMN_KEY = "value"

export const ManagerStatList = ({ rows, emptyTitle, emptyMessage }: Props): JSX.Element => {
  const columns: ManagerTableColumn[] = [
    { key: VALUE_COLUMN_KEY, header: rows[0]?.primary.label ?? "", className: "w-16" },
  ]

  const tableRows: ManagerTableRow[] = rows.map((row) => ({
    key: String(row.entryApiId),
    rank: row.rank,
    entryApiId: row.entryApiId,
    leagueId: row.leagueId,
    managerName: row.managerName,
    teamName: row.teamName,
    detail: row.detail,
    cells: { [VALUE_COLUMN_KEY]: row.primary.value },
  }))

  return (
    <ManagerTable
      columns={columns}
      rows={tableRows}
      showFaces
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
    />
  )
}
