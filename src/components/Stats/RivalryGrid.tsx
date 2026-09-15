"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { Avatar, AvatarFallback, AvatarImage } from "@pbd/components/ui/avatar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pbd/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pbd/components/ui/table"
import { useRivalryGrid } from "@pbd/hooks/fpl/useRivalryGrid"
import { cn } from "@pbd/lib/className"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import { leagueLabelForId } from "@pbd/lib/leagues"
import { ShieldCheck } from "lucide-react"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

type Cell = { wins: number; draws: number; losses: number; margin: number }

const GRID_CELL_CLASSES = "h-8 min-w-8 rounded p-0 text-center text-[10px] font-bold tabular-nums"

const cellClasses = (wins: number, losses: number): string => {
  if (wins > losses) return "bg-green-500/15 text-green-400"
  if (wins < losses) return "bg-red-500/15 text-red-400"
  return "bg-muted/40 text-muted-foreground"
}

const recordLabel = (cell: Cell): string =>
  cell.draws > 0 ? `${cell.wins}-${cell.draws}-${cell.losses}` : `${cell.wins}-${cell.losses}`

const leadLabel = (cell: Cell): string =>
  cell.draws > 0 ? `${cell.losses}-${cell.draws}-${cell.wins}` : `${cell.losses}-${cell.wins}`

export const RivalryGrid = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useRivalryGrid({ leagueIds })

  const grids = data.filter((grid) => grid.managers.length > 0)
  if (grids.length === 0)
    return (
      <EmptyState
        title="No Rivalries Yet"
        message="Head-to-head grids appear once the first gameweek is complete."
      />
    )

  return (
    <LeagueStack leagueIds={grids.map((grid) => grid.leagueId)} gap="loose">
      {(leagueId) => {
        const grid = grids.find((g) => g.leagueId === leagueId)
        if (!grid) return null
        const nameOf = (entryApiId: number): string =>
          grid.managers.find((m) => m.entryApiId === entryApiId)?.managerName ?? ""
        return (
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {leagueLabelForId(leagueId)}
            </p>

            <div className="rounded-2xl border bg-card p-3">
              <Table className="border-separate border-spacing-1">
                <TableHeader className="[&_tr]:border-0">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-auto p-0" aria-label="Manager" />
                    {grid.managers.map((manager) => (
                      <TableHead
                        key={manager.entryApiId}
                        className="h-auto px-1 text-center text-[10px] font-bold text-muted-foreground"
                      >
                        {manager.managerName}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grid.managers.map((manager, rowIndex) => (
                    <TableRow key={manager.entryApiId} className="border-0 hover:bg-transparent">
                      <TableCell className="max-w-20 truncate p-0 pr-1 text-xs font-semibold text-foreground">
                        {manager.managerName}
                      </TableCell>
                      {grid.managers.map((opponent, colIndex) => {
                        const cell = grid.cells[rowIndex]?.[colIndex]
                        if (!cell || manager.entryApiId === opponent.entryApiId)
                          return (
                            <TableCell
                              key={opponent.entryApiId}
                              className={cn(GRID_CELL_CLASSES, "bg-muted/20")}
                            />
                          )
                        return (
                          <TableCell
                            key={opponent.entryApiId}
                            title={`${manager.managerName} vs ${opponent.managerName}: ${recordLabel(cell)}`}
                            className={cn(GRID_CELL_CLASSES, cellClasses(cell.wins, cell.losses))}
                          >
                            {cell.wins}-{cell.losses}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Nemesis
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {grid.extremes.map((extreme) => {
                  const record = extreme.nemesisRecord
                  if (extreme.nemesisApiId === null || !record) return null
                  const isBeaten = record.losses > record.wins
                  const nemesisName = nameOf(extreme.nemesisApiId)
                  const image = PARTICIPANT_BY_API_ID[extreme.nemesisApiId]?.image
                  return (
                    <Item
                      key={extreme.entryApiId}
                      variant="outline"
                      size="sm"
                      className="rounded-xl bg-card px-3 py-2.5"
                    >
                      <ItemMedia>
                        {isBeaten ? (
                          <Avatar size="lg" className="ring-1 ring-border">
                            <AvatarImage
                              src={image ?? undefined}
                              alt={nemesisName}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-sm font-bold">
                              {nemesisName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar size="lg">
                            <AvatarFallback>
                              <ShieldCheck className="size-4 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0">
                        <ItemDescription className="line-clamp-1 text-[11px]">
                          {nameOf(extreme.entryApiId)}'s nemesis
                        </ItemDescription>
                        <ItemTitle className="block w-full truncate text-sm font-bold leading-tight">
                          {isBeaten ? nemesisName : "Nobody yet"}
                        </ItemTitle>
                      </ItemContent>
                      {isBeaten && (
                        <ItemActions className="flex-col items-end gap-0">
                          <p className="text-sm font-black tabular-nums text-foreground">
                            {leadLabel(record)}
                          </p>
                          <p className="text-[9px] uppercase tracking-wide text-muted-foreground/60">
                            their lead
                          </p>
                        </ItemActions>
                      )}
                    </Item>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }}
    </LeagueStack>
  )
}
