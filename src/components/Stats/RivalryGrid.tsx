"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { useRivalryGrid } from "@pbd/hooks/fpl/useRivalryGrid"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { ShieldCheck, Swords } from "lucide-react"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

type Cell = { wins: number; draws: number; losses: number; margin: number }

const cellClasses = (wins: number, losses: number): string => {
  if (wins > losses) return "bg-green-500/15 text-green-400"
  if (wins < losses) return "bg-red-500/15 text-red-400"
  return "bg-muted/40 text-muted-foreground"
}

const recordLabel = (cell: Cell): string =>
  cell.draws > 0 ? `${cell.wins}-${cell.draws}-${cell.losses}` : `${cell.wins}-${cell.losses}`

const marginLabel = (margin: number): string => {
  if (margin < 0) return `${Math.abs(margin)} pts adrift`
  if (margin > 0) return `${margin} pts ahead`
  return "level on points"
}

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
              {leagueId === LEAGUE_IDS.PREMIERSHIP
                ? LEAGUE_LABELS.premiership
                : LEAGUE_LABELS.championship}
            </p>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3">
              <table className="w-full border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th aria-label="Manager" />
                    {grid.managers.map((manager) => (
                      <th
                        key={manager.entryApiId}
                        className="whitespace-nowrap px-1 text-center text-[10px] font-bold text-muted-foreground"
                      >
                        {manager.managerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.managers.map((manager, rowIndex) => (
                    <tr key={manager.entryApiId}>
                      <td className="max-w-20 truncate pr-1 text-xs font-semibold text-foreground">
                        {manager.managerName}
                      </td>
                      {grid.managers.map((opponent, colIndex) => {
                        const cell = grid.cells[rowIndex]?.[colIndex]
                        if (!cell || manager.entryApiId === opponent.entryApiId)
                          return (
                            <td
                              key={opponent.entryApiId}
                              className="h-8 min-w-8 rounded bg-muted/20"
                            />
                          )
                        return (
                          <td
                            key={opponent.entryApiId}
                            title={`${manager.managerName} vs ${opponent.managerName}: ${recordLabel(cell)}, ${marginLabel(cell.margin)}`}
                            className={`h-8 min-w-8 rounded text-center text-[10px] font-bold tabular-nums ${cellClasses(cell.wins, cell.losses)}`}
                          >
                            {cell.wins}-{cell.losses}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  return (
                    <div
                      key={extreme.entryApiId}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isBeaten ? "bg-red-500/15" : "bg-emerald-500/15"
                        }`}
                      >
                        {isBeaten ? (
                          <Swords className="h-4 w-4 text-red-400" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {nameOf(extreme.entryApiId)}
                        </p>
                        <p className="truncate text-sm font-bold leading-tight text-foreground">
                          {isBeaten ? nameOf(extreme.nemesisApiId) : "Nobody yet"}
                        </p>
                        <p className="truncate text-[11px] tabular-nums text-muted-foreground/80">
                          {isBeaten
                            ? marginLabel(record.margin)
                            : `unbeaten, closest is ${nameOf(extreme.nemesisApiId)}`}
                        </p>
                      </div>
                      {isBeaten && (
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black tabular-nums text-red-400">
                            {recordLabel(record)}
                          </p>
                          <p className="text-[9px] uppercase tracking-wide text-muted-foreground/60">
                            {record.draws > 0 ? "W-D-L" : "W-L"}
                          </p>
                        </div>
                      )}
                    </div>
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
