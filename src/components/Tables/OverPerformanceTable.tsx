"use client"

import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import { useSquadReturns } from "@pbd/hooks/fpl/useSquadReturns"
import { fmtSigned } from "@pbd/lib/format"
import { computeOverPerformance } from "@pbd/lib/fpl/stats/overPerformance"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const COLUMNS: ManagerTableColumn[] = [{ key: "difference", header: "+/-", className: "w-16" }]

const differenceTone = (difference: number): string | undefined => {
  if (difference > 0) return "text-green-400"
  if (difference < 0) return "text-red-400"
  return undefined
}

export const OverPerformanceTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useSquadReturns({ leagueIds })

  const ranked = data
    .map((row) => ({ ...row, ...computeOverPerformance(row) }))
    .sort(
      (a, b) =>
        b.difference - a.difference ||
        (b.differencePct ?? 0) - (a.differencePct ?? 0) ||
        b.involvements - a.involvements,
    )

  const rows: ManagerTableRow[] = ranked.map((row, index) => ({
    key: String(row.entryApiId),
    rank: index + 1,
    entryApiId: row.entryApiId,
    leagueId: row.leagueId,
    managerName: row.managerName,
    teamName: row.teamName,
    detail: `${row.involvements} G/A · ${row.expectedInvolvements} xGA`,
    cells: {
      difference: (
        <div className="flex flex-col items-end">
          <span className={differenceTone(row.difference)}>{fmtSigned(row.difference)}</span>
          {row.differencePct !== null && (
            <span className="text-xs font-medium text-muted-foreground">
              {fmtSigned(row.differencePct)}%
            </span>
          )}
        </div>
      ),
    },
  }))

  return (
    <ManagerTable
      columns={COLUMNS}
      rows={rows}
      showFaces
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
