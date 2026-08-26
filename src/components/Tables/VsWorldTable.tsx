"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useVsWorldTable } from "@pbd/hooks/fpl/useVsWorldTable"
import { fmtSigned } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

export const VsWorldTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useVsWorldTable({ leagueIds })

  if (data.length > 0 && data.every((row) => row.gwCount === 0))
    return (
      <EmptyState
        title="Global Averages Unavailable"
        message="FPL hasn't published gameweek averages yet."
      />
    )

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => b.beatPct - a.beatPct || b.avgMargin - a.avgMargin)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: `${row.beatPct}%`, label: "Vs World" },
      detail: `beat ${row.beats}/${row.gwCount} · avg ${fmtSigned(row.avgMargin)}`,
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
