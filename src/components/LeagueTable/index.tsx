"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pbd/components/ui/table"
import type { LeagueEntry, Standing } from "@pbd/types/fpl.types"
import { useTRPC } from "@pbd/trpc/react"
import { RankCell } from "./RankCell"

type TableMode = "total" | "form"

type LeagueTableProps = {
  leagueId: number
  mode: TableMode
}

type TableRow = {
  rank: number
  lastRank: number
  playerName: string
  teamName: string
  score: number
}

const buildRows = (
  standings: Standing[],
  entryMap: Map<number, LeagueEntry>,
  mode: TableMode,
): TableRow[] => {
  if (mode === "total")
    return standings
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((s) => {
        const entry = entryMap.get(s.league_entry)
        return {
          rank: s.rank,
          lastRank: s.last_rank,
          playerName: entry
            ? `${entry.player_first_name} ${entry.player_last_name}`
            : "Unknown",
          teamName: entry?.entry_name ?? "Unknown",
          score: s.total,
        }
      })

  return standings
    .slice()
    .sort((a, b) => b.event_total - a.event_total)
    .map((s, i) => {
      const entry = entryMap.get(s.league_entry)
      return {
        rank: i + 1,
        lastRank: 0,
        playerName: entry
          ? `${entry.player_first_name} ${entry.player_last_name}`
          : "Unknown",
        teamName: entry?.entry_name ?? "Unknown",
        score: s.event_total,
      }
    })
}

export const LeagueTable = ({ leagueId, mode }: LeagueTableProps): JSX.Element => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.fpl.leagueDetails.queryOptions({ leagueId }))

  const entryMap = useMemo(
    () => new Map(data.league_entries.map((e) => [e.id, e])),
    [data.league_entries],
  )

  const rows = useMemo(
    () => buildRows(data.standings, entryMap, mode),
    [data.standings, entryMap, mode],
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.playerName}>
            <TableCell>
              <RankCell rank={row.rank} lastRank={row.lastRank} showArrows={mode === "total"} />
            </TableCell>
            <TableCell className="font-medium">{row.playerName}</TableCell>
            <TableCell className="text-muted-foreground">{row.teamName}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{row.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
