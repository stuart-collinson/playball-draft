"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge"
import { useGotAway } from "@pbd/hooks/fpl/useGotAway"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

export const GotAwayTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useGotAway({ leagueIds })

  if (data.length === 0)
    return (
      <EmptyState
        title="Nothing Got Away Yet"
        message="Dropped players start haunting their old managers after the next gameweek."
      />
    )

  return (
    <div className="flex flex-col gap-2">
      {data.map((row, index) => (
        <div
          key={`${row.leagueId}-${row.elementId}-${row.droppedEvent}-${row.entryApiId}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
        >
          <RankBadge rank={index + 1} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {row.playerName}
              {row.playerTeam && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {row.playerTeam}
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              dropped by {row.managerName} · GW{row.droppedEvent} · {row.gwsSince}{" "}
              {row.gwsSince === 1 ? "gw" : "gws"} since
            </p>
          </div>
          <div className="w-14 shrink-0 text-right">
            <p className="text-base font-black tabular-nums text-foreground">
              {fmtPts(row.pointsSince)}
            </p>
            <p className="text-[10px] text-muted-foreground/60">Since</p>
          </div>
        </div>
      ))}
    </div>
  )
}
