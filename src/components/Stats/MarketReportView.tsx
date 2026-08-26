"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { useMarketReport } from "@pbd/hooks/fpl/useMarketReport"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

type ReportRow = { elementId: number; playerName: string; playerTeam: string; count: number }

const SECTIONS: { key: "mostAdded" | "mostDropped" | "mostWanted"; label: string }[] = [
  { key: "mostAdded", label: "Most Added" },
  { key: "mostDropped", label: "Most Dropped" },
  { key: "mostWanted", label: "Most Wanted" },
]

const countLabel = (section: string, count: number): string => {
  if (section === "mostWanted") return count === 1 ? "claim" : "claims"
  return count === 1 ? "move" : "moves"
}

export const MarketReportView = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useMarketReport({ leagueIds })

  const isEmpty = SECTIONS.every((section) => data[section.key].length === 0)
  if (isEmpty)
    return (
      <EmptyState
        title="No Market Activity"
        message="The market report fills in once waivers and free agents start moving."
      />
    )

  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => {
        const rows: ReportRow[] = data[section.key]
        if (rows.length === 0) return null
        return (
          <div key={section.key} className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            {rows.map((row) => (
              <div
                key={row.elementId}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {row.playerName}
                    {row.playerTeam && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {row.playerTeam}
                      </span>
                    )}
                  </p>
                </div>
                <div className="w-16 shrink-0 text-right">
                  <p className="text-base font-black tabular-nums text-foreground">{row.count}</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {countLabel(section.key, row.count)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
