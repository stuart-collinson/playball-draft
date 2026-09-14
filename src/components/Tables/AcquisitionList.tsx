"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { PlayerDetails } from "@pbd/components/PlayerDetails/PlayerDetails"
import { RankBadge } from "@pbd/components/RankBadge/RankBadge"
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps"
import { cn } from "@pbd/lib/className"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useState } from "react"

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

type Props = {
  rows: AcquisitionRow[]
  sortBy: "total" | "avg"
  emptyTitle: string
  emptyMessage: string
}

const KIND_BADGES: Record<"w" | "f", { label: string; className: string }> = {
  f: { label: "FA", className: "bg-violet-500/20 text-violet-400" },
  w: { label: "W", className: "bg-sky-500/20 text-sky-400" },
}

const AVERAGE_DECIMALS = 1

const ownershipSpan = (row: AcquisitionRow): string =>
  `GW${row.acquiredEvent}${row.droppedEvent !== null ? `–${row.droppedEvent - 1}` : "+"}`

export const AcquisitionList = ({ rows, sortBy, emptyTitle, emptyMessage }: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(null)
  const { overallRankMap, leagueRankMap } = useRankMaps()

  if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => {
          const badge = row.kind ? KIND_BADGES[row.kind] : null

          return (
            <button
              type="button"
              key={`${row.playerName}-${row.managerName}-${row.acquiredEvent}`}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
              onClick={() =>
                setSelectedPlayer({
                  apiId: row.entryApiId,
                  playerName: row.managerName,
                  teamName: row.teamName,
                  leagueId: row.leagueId,
                  leaguePosition: leagueRankMap.get(row.entryApiId) ?? 0,
                  overallPosition: overallRankMap.get(row.entryApiId) ?? 0,
                })
              }
            >
              <RankBadge rank={index + 1} />

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                  {row.playerName}
                  {row.playerTeam && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {row.playerTeam}
                    </span>
                  )}
                  {badge && (
                    <span
                      className={cn(
                        "shrink-0 rounded px-1 py-0.5 text-[10px] font-bold leading-none",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.managerName} · {row.teamName}
                </p>
              </div>

              <div className="w-24 shrink-0 text-center">
                <p className="text-sm font-medium tabular-nums text-muted-foreground">
                  {ownershipSpan(row)}
                </p>
              </div>

              <div className="w-12 shrink-0 text-right">
                <p className="text-base font-black tabular-nums text-foreground">
                  {sortBy === "avg" ? row.avgPoints.toFixed(AVERAGE_DECIMALS) : row.points}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {sortBy === "avg" ? "Avg PPG" : "Points"}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <PlayerDetails player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </>
  )
}
