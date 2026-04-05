"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import { fmtPts } from "@pbd/lib/utils/fmt";
import type { LeagueEntry, Standing } from "@pbd/types/fpl.types";
import { useTRPC } from "@pbd/trpc/react";
import { RankBadge } from "./RankBadge";
import PlayerDetails from "../Modals/PlayerDetails";
import type { PlayerDialogData } from "../Modals/PlayerDetails";

type TableMode = "total" | "form";

type LeagueTableProps = {
  leagueId: number;
  mode: TableMode;
};

type RowData = {
  leagueEntryId: number;
  rank: number;
  lastRank: number;
  playerName: string;
  teamName: string;
  total: number;
  gwScore: number;
  avg: number;
  overallRank: number;
};

const buildRows = (
  standings: Standing[],
  entryMap: Map<number, LeagueEntry>,
  mode: TableMode,
  gwsPlayed: number,
  overallRankMap: Map<number, number>,
): RowData[] => {
  const sorted =
    mode === "total"
      ? standings.slice().sort((a, b) => a.rank - b.rank)
      : standings.slice().sort((a, b) => b.event_total - a.event_total);

  return sorted.map((s, i) => {
    const entry = entryMap.get(s.league_entry);
    return {
      leagueEntryId: s.league_entry,
      rank: mode === "total" ? s.rank : i + 1,
      lastRank: mode === "total" ? s.last_rank : 0,
      playerName: PARTICIPANT_BY_API_ID[s.league_entry]?.name ?? "Unknown",
      teamName: entry?.entry_name ?? "Unknown",
      total: s.total,
      gwScore: s.event_total,
      avg: gwsPlayed > 0 ? s.total / gwsPlayed : 0,
      overallRank: overallRankMap.get(s.league_entry) ?? 0,
    };
  });
};

export const LeagueTable = ({
  leagueId,
  mode,
}: LeagueTableProps): JSX.Element => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId }),
  );
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  );
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
  );
  const { data: bootstrap } = useSuspenseQuery(
    trpc.fpl.bootstrapStatic.queryOptions(),
  );

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(
    null,
  );

  const gwsPlayed = bootstrap.events.current - data.league.start_event + 1;

  const leagueName =
    leagueId === LEAGUE_IDS.PREMIERSHIP ? "Premiership" : "Championship";

  const entryMap = useMemo(
    () => new Map(data.league_entries.map((e) => [e.id, e])),
    [data.league_entries],
  );

  const overallRankMap = useMemo(() => {
    const combined = [...premData.standings, ...champData.standings]
      .slice()
      .sort((a, b) => b.total - a.total);
    return new Map(combined.map((s, i) => [s.league_entry, i + 1]));
  }, [premData.standings, champData.standings]);

  const rows = useMemo(
    () => buildRows(data.standings, entryMap, mode, gwsPlayed, overallRankMap),
    [data.standings, entryMap, mode, gwsPlayed, overallRankMap],
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            type="button"
            key={row.playerName}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
            onClick={() =>
              setSelectedPlayer({
                apiId: row.leagueEntryId,
                playerName: row.playerName,
                teamName: row.teamName,
                leagueName,
                leaguePosition: row.rank,
                overallPosition: row.overallRank,
              })
            }
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
                    {row.avg.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    Avg Pts
                  </p>
                </div>
              )}
              <div className="w-10 text-right">
                <p className="text-base font-black tabular-nums text-foreground">
                  {fmtPts(mode === "total" ? row.total : row.gwScore)}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Points</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <PlayerDetails
        open={selectedPlayer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedPlayer(null);
        }}
        player={selectedPlayer}
      />
    </>
  );
};
