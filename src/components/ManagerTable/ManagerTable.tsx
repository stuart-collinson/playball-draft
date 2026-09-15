"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { PlayerDetails } from "@pbd/components/PlayerDetails/PlayerDetails"
import { RankBadge } from "@pbd/components/RankBadge/RankBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pbd/components/ui/table"
import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails"
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps"
import { cn } from "@pbd/lib/className"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import {
  TABLE_CELL_CLASSES,
  TABLE_HEAD_CLASSES,
  TABLE_SHELL_CLASSES,
} from "@pbd/lib/constants/Tables"
import { personSlug } from "@pbd/lib/people"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX, MouseEvent } from "react"
import { useMemo, useState } from "react"

type Props = {
  columns: ManagerTableColumn[]
  rows: ManagerTableRow[]
  showFaces?: boolean
  showRankArrows?: boolean
  emptyTitle: string
  emptyMessage: string
}

const UNKNOWN_TEAM = "Unknown"

const ALIGN_CLASSES: Record<NonNullable<ManagerTableColumn["align"]>, string> = {
  right: "text-right",
  center: "text-center",
}

const EMPHASIS_CLASSES: Record<NonNullable<ManagerTableColumn["emphasis"]>, string> = {
  primary: "text-base font-black tabular-nums text-foreground",
  muted: "text-sm font-medium tabular-nums text-muted-foreground",
}

const faceSlug = (row: ManagerTableRow): string =>
  personSlug(PARTICIPANT_BY_API_ID[row.entryApiId]?.name ?? row.managerName)

export const ManagerTable = ({
  columns,
  rows,
  showFaces = false,
  showRankArrows = false,
  emptyTitle,
  emptyMessage,
}: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(null)
  const { overallRankMap, leagueRankMap } = useRankMaps()
  const { premData, champData } = useBothLeagueDetails()

  const teamNames = useMemo(
    () =>
      new Map(
        [...premData.league_entries, ...champData.league_entries].map((entry) => [
          entry.id,
          entry.entry_name,
        ]),
      ),
    [premData.league_entries, champData.league_entries],
  )

  if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />

  const teamNameFor = (row: ManagerTableRow): string =>
    row.teamName ?? teamNames.get(row.entryApiId) ?? UNKNOWN_TEAM

  const openManager = (row: ManagerTableRow): void =>
    setSelectedPlayer({
      apiId: row.entryApiId,
      playerName: row.managerName,
      teamName: teamNameFor(row),
      leagueId: row.leagueId,
      leaguePosition: leagueRankMap.get(row.entryApiId) ?? 0,
      overallPosition: overallRankMap.get(row.entryApiId) ?? 0,
    })

  const openFromButton = (event: MouseEvent<HTMLButtonElement>, row: ManagerTableRow): void => {
    event.stopPropagation()
    openManager(row)
  }

  return (
    <>
      <div className={TABLE_SHELL_CLASSES}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className={cn(TABLE_HEAD_CLASSES, "w-14 pr-1 text-center")}
                aria-label="Rank"
              >
                #
              </TableHead>
              <TableHead className={TABLE_HEAD_CLASSES}>
                <span className="flex items-center gap-2.5">
                  {showFaces && <span aria-hidden="true" className="size-8 shrink-0" />}
                  Manager
                </span>
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    TABLE_HEAD_CLASSES,
                    ALIGN_CLASSES[column.align ?? "right"],
                    column.className,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                onClick={() => openManager(row)}
                className="cursor-pointer active:bg-muted"
              >
                <TableCell className={cn(TABLE_CELL_CLASSES, "pr-1")}>
                  <RankBadge rank={row.rank} lastRank={row.lastRank} showArrows={showRankArrows} />
                </TableCell>

                <TableCell className={cn(TABLE_CELL_CLASSES, "w-full max-w-0")}>
                  <div className="flex items-center gap-2.5">
                    {showFaces && <PersonFace slug={faceSlug(row)} className="size-8 ring-0" />}
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(event) => openFromButton(event, row)}
                        className="block w-full truncate text-left font-semibold text-foreground outline-none focus-visible:underline focus-visible:decoration-ring"
                      >
                        {row.title ?? row.managerName}
                      </button>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.subtitle ?? teamNameFor(row)}
                      </p>
                      {row.detail && (
                        <p className="truncate text-xs tabular-nums text-muted-foreground/80">
                          {row.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      TABLE_CELL_CLASSES,
                      ALIGN_CLASSES[column.align ?? "right"],
                      EMPHASIS_CLASSES[column.emphasis ?? "primary"],
                      column.className,
                    )}
                  >
                    {row.cells[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PlayerDetails player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </>
  )
}
