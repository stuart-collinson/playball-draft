"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useScoreDistributionTable } from "@pbd/hooks/fpl/useScoreDistributionTable"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  variant: "consistency" | "floor-ceiling" | "thresholds"
}

export const ScoreDistributionTable = ({ leagueIds, variant }: Props): JSX.Element => {
  const { data } = useScoreDistributionTable({ leagueIds })

  const sorted = [...data].sort((a, b) => {
    if (variant === "consistency") return a.stdDev - b.stdDev || b.average - a.average
    if (variant === "floor-ceiling") return b.ceiling - a.ceiling || b.floor - a.floor
    return b.over60 - a.over60 || b.over70 - a.over70 || b.over50 - a.over50
  })

  const rows: ManagerStatRow[] = sorted.map((row, index) => {
    const primary =
      variant === "consistency"
        ? { value: `±${row.stdDev}`, label: "Std Dev" }
        : variant === "floor-ceiling"
          ? { value: `${row.ceiling}`, label: "Ceiling" }
          : { value: `${row.over60}`, label: "60+ GWs" }
    const detail =
      variant === "consistency"
        ? `avg ${row.average}`
        : variant === "floor-ceiling"
          ? `floor ${row.floor} · avg ${row.average}`
          : `50+ ${row.over50} · 70+ ${row.over70}`
    return {
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary,
      detail,
    }
  })

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
