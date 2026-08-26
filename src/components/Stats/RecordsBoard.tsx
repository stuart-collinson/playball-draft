"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { useRecordsBoard } from "@pbd/hooks/fpl/useRecordsBoard"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const RECORD_LABELS: Record<string, string> = {
  "biggest-margin": "Biggest Winning Margin",
  "closest-call": "Closest Call",
  "highest-week": "Highest League Week",
  "best-non-winner": "Best Losing Score",
  "lowest-winner": "Cheapest Win",
  "biggest-bench-waste": "Biggest Bench Waste",
}

const RECORD_UNITS: Record<string, string> = {
  "biggest-margin": "pt margin",
  "closest-call": "pt gap",
  "highest-week": "combined pts",
  "best-non-winner": "pts, no win",
  "lowest-winner": "pts, still won",
  "biggest-bench-waste": "pts benched",
}

export const RecordsBoard = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useRecordsBoard({ leagueIds })
  const showLeague = leagueIds.length > 1

  if (data.length === 0)
    return (
      <EmptyState
        title="No Records Yet"
        message="Records start landing once the first gameweek is complete."
      />
    )

  return (
    <div className="flex flex-col gap-2">
      {data.map((record) => {
        const leagueLabel =
          record.leagueId === LEAGUE_IDS.PREMIERSHIP
            ? LEAGUE_LABELS.premiership
            : LEAGUE_LABELS.championship
        const holderNames = record.holders.map((holder) => holder.managerName).join(" & ")
        const event = record.holders[0]?.event
        return (
          <div
            key={`${record.leagueId}-${record.key}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {RECORD_LABELS[record.key] ?? record.key}
              </p>
              <p className="truncate font-semibold text-foreground">{holderNames || leagueLabel}</p>
              <p className="truncate text-xs text-muted-foreground">
                {event ? `Gameweek ${event}` : "Whole league"}
                {showLeague && ` · ${leagueLabel}`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-black tabular-nums text-foreground">{record.value}</p>
              <p className="text-[10px] text-muted-foreground/60">{RECORD_UNITS[record.key]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
