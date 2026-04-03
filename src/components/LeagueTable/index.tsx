"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { JSX } from "react";
import { useMemo } from "react";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import type { LeagueEntry, Standing } from "@pbd/types/fpl.types";
import { useTRPC } from "@pbd/trpc/react";

type TableMode = "total" | "form";

type LeagueTableProps = {
  leagueId: number;
  mode: TableMode;
};

type RowData = {
  rank: number;
  lastRank: number;
  playerName: string;
  teamName: string;
  total: number;
  gwScore: number;
};

const buildRows = (
  standings: Standing[],
  entryMap: Map<number, LeagueEntry>,
  mode: TableMode,
): RowData[] => {
  const sorted =
    mode === "total"
      ? standings.slice().sort((a, b) => a.rank - b.rank)
      : standings.slice().sort((a, b) => b.event_total - a.event_total);

  return sorted.map((s, i) => {
    const entry = entryMap.get(s.league_entry);
    return {
      rank: mode === "total" ? s.rank : i + 1,
      lastRank: mode === "total" ? s.last_rank : 0,
      playerName: PARTICIPANT_BY_API_ID[s.league_entry]?.name ?? "Unknown",
      teamName: entry?.entry_name ?? "Unknown",
      total: s.total,
      gwScore: s.event_total,
    };
  });
};

type RankBadgeProps = {
  rank: number;
  lastRank: number;
  showArrows: boolean;
};

const RankBadge = ({
  rank,
  lastRank,
  showArrows,
}: RankBadgeProps): JSX.Element => {
  const improved = showArrows && lastRank > 0 && rank < lastRank;
  const dropped = showArrows && lastRank > 0 && rank > lastRank;

  return (
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
      {improved && <ArrowUp className="h-3 w-3 text-rank-up" />}
      {dropped && <ArrowDown className="h-3 w-3 text-rank-down" />}
    </div>
  );
};

export const LeagueTable = ({
  leagueId,
  mode,
}: LeagueTableProps): JSX.Element => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId }),
  );

  const entryMap = useMemo(
    () => new Map(data.league_entries.map((e) => [e.id, e])),
    [data.league_entries],
  );

  const rows = useMemo(
    () => buildRows(data.standings, entryMap, mode),
    [data.standings, entryMap, mode],
  );

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.playerName}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
        >
          <RankBadge
            rank={row.rank}
            lastRank={row.lastRank}
            showArrows={mode === "total"}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {row.playerName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.teamName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-8">
            {mode === "total" && (
              <div className="w-10 text-right">
                <p className="text-base font-bold tabular-nums text-muted-foreground">
                  {row.gwScore}
                </p>
                <p className="text-[10px] text-muted-foreground/60">GW Pts</p>
              </div>
            )}
            <div className="w-10 text-right">
              <p className="text-base font-black tabular-nums text-foreground">
                {mode === "total" ? row.total : row.gwScore}
              </p>
              <p className="text-[10px] text-muted-foreground/60">Points</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
