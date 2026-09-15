import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import { PlayerLabel } from "@pbd/components/PlayerLabel/PlayerLabel"
import { Badge } from "@pbd/components/ui/badge"
import { cn } from "@pbd/lib/className"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"

type AcquisitionRow = {
  playerName: string
  playerTeam: string
  managerName: string
  teamName: string
  acquiredEvent: number
  droppedEvent: number | null
  points: number
  avgPoints: number
  entryApiId: number
  leagueId: number
  kind?: "w" | "f"
}

type SortBy = "total" | "avg"

type Props = {
  rows: AcquisitionRow[]
  sortBy: SortBy
  emptyTitle: string
  emptyMessage: string
}

const KIND_BADGES: Record<"w" | "f", { label: string; className: string }> = {
  f: { label: "FA", className: "bg-violet-500/20 text-violet-400" },
  w: { label: "W", className: "bg-sky-500/20 text-sky-400" },
}

const AVERAGE_DECIMALS = 1

const OWNED_COLUMN: ManagerTableColumn = {
  key: "owned",
  header: "Owned",
  align: "center",
  emphasis: "muted",
  className: "w-20",
}

const POINTS_HEADERS: Record<SortBy, string> = { total: "Pts", avg: "PPG" }

const ownershipSpan = (row: AcquisitionRow): string =>
  `GW${row.acquiredEvent}${row.droppedEvent !== null ? `–${row.droppedEvent - 1}` : "+"}`

const pointsFor = (row: AcquisitionRow, sortBy: SortBy): string =>
  sortBy === "avg" ? row.avgPoints.toFixed(AVERAGE_DECIMALS) : String(row.points)

export const AcquisitionList = ({ rows, sortBy, emptyTitle, emptyMessage }: Props): JSX.Element => {
  const columns: ManagerTableColumn[] = [
    OWNED_COLUMN,
    { key: "points", header: POINTS_HEADERS[sortBy], className: "w-14" },
  ]

  const tableRows: ManagerTableRow[] = rows.map((row, index) => {
    const badge = row.kind ? KIND_BADGES[row.kind] : null

    return {
      key: `${row.playerName}-${row.managerName}-${row.acquiredEvent}`,
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      title: (
        <PlayerLabel name={row.playerName} club={row.playerTeam}>
          {badge && (
            <Badge
              variant="secondary"
              className={cn("px-1.5 py-0 text-[10px] font-bold", badge.className)}
            >
              {badge.label}
            </Badge>
          )}
        </PlayerLabel>
      ),
      subtitle: `${row.managerName} · ${row.teamName}`,
      cells: { owned: ownershipSpan(row), points: pointsFor(row, sortBy) },
    }
  })

  return (
    <ManagerTable
      columns={columns}
      rows={tableRows}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
    />
  )
}
