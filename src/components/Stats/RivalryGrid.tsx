"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { useRivalryGrid } from "@pbd/hooks/fpl/useRivalryGrid"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const cellClasses = (wins: number, losses: number): string => {
  if (wins > losses) return "bg-green-500/15 text-green-400"
  if (wins < losses) return "bg-red-500/15 text-red-400"
  return "bg-muted/40 text-muted-foreground"
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
          <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-1">
              {grid.extremes.map((extreme) => (
                <p key={extreme.entryApiId} className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {nameOf(extreme.entryApiId)}
                  </span>
                  {extreme.nemesisApiId !== null && extreme.nemesisRecord && (
                    <>
                      {" — nemesis "}
                      {nameOf(extreme.nemesisApiId)} ({extreme.nemesisRecord.wins}-
                      {extreme.nemesisRecord.losses})
                    </>
                  )}
                </p>
              ))}
            </div>
          </div>
        )
      }}
    </LeagueStack>
  )
}
