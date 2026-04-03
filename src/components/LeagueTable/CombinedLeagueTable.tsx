"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp } from "lucide-react"
import type { JSX } from "react"
import { useMemo } from "react"
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import type { LeagueEntry, Standing } from "@pbd/types/fpl.types"
import { useTRPC } from "@pbd/trpc/react"

type RowData = {
  rank: number
  lastRank: number
  playerName: string
  teamName: string
  total: number
  gwScore: number
  avg: number
}

const buildCombinedRows = (
  allStandings: Standing[],
  entryMap: Map<number, LeagueEntry>,
  gwsPlayed: number,
): RowData[] => {
  const sorted = allStandings.slice().sort((a, b) => b.total - a.total)

  return sorted.map((s, i) => {
    const entry = entryMap.get(s.league_entry)
    return {
      rank: i + 1,
      lastRank: 0,
      playerName: PARTICIPANT_BY_API_ID[s.league_entry]?.name ?? "Unknown",
      teamName: entry?.entry_name ?? "Unknown",
      total: s.total,
      gwScore: s.event_total,
      avg: gwsPlayed > 0 ? s.total / gwsPlayed : 0,
    }
  })
}

type RankBadgeProps = {
  rank: number
}

const RankBadge = ({ rank }: RankBadgeProps): JSX.Element => (
  <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
    {rank === 1 ? (
      <div className="relative flex h-8 w-8 items-end justify-center pb-0.5">
        <span className="absolute -top-0.5 left-1/2 -translate-x-[25%] rotate-12 text-sm leading-none select-none">
          👑
        </span>
        <span className="text-base font-black text-foreground">1</span>
      </div>
    ) : (
      <span className="flex h-8 w-8 items-center justify-center text-base font-black tabular-nums text-muted-foreground">
        {rank}
      </span>
    )}
  </div>
)

export const CombinedLeagueTable = (): JSX.Element => {
  const trpc = useTRPC()
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  )
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID.championship }),
  )
  const { data: bootstrap } = useSuspenseQuery(trpc.fpl.bootstrapStatic.queryOptions())

  const gwsPlayed = bootstrap.events.current - premData.league.start_event + 1

  const entryMap = useMemo(() => {
    const map = new Map<number, LeagueEntry>()
    for (const e of premData.league_entries) map.set(e.id, e)
    for (const e of champData.league_entries) map.set(e.id, e)
    return map
  }, [premData.league_entries, champData.league_entries])

  const rows = useMemo(
    () =>
      buildCombinedRows(
        [...premData.standings, ...champData.standings],
        entryMap,
        gwsPlayed,
      ),
    [premData.standings, champData.standings, entryMap, gwsPlayed],
  )

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.playerName}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
        >
          <RankBadge rank={row.rank} />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{row.playerName}</p>
            <p className="truncate text-xs text-muted-foreground">{row.teamName}</p>
          </div>

          <div className="flex shrink-0 items-center gap-8">
            <div className="w-10 text-right">
              <p className="text-base font-bold tabular-nums text-muted-foreground">
                {row.avg.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground/60">Avg Pts</p>
            </div>
            <div className="w-10 text-right">
              <p className="text-base font-black tabular-nums text-foreground">{row.total}</p>
              <p className="text-[10px] text-muted-foreground/60">Points</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
