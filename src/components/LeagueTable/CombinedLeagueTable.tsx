"use client";

import {
  LEAGUE_IDS,
  LEAGUE_LABELS,
  LEAGUE_SLUG_TO_ID,
} from "@pbd/lib/constants/fpl";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import { fmtPts } from "@pbd/lib/utils/fmt";
import { useTRPC } from "@pbd/trpc/react";
import type { LeagueEntry, Standing } from "@pbd/types/fpl.types";
import type { PlayerDialogData } from "@pbd/types/player.types";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import PlayerDetails from "../Modals/PlayerDetails";
import { RankBadge } from "./RankBadge";

type RowData = {
  leagueEntryId: number;
  rank: number;
  playerName: string;
  teamName: string;
  total: number;
  gwScore: number;
  avg: number;
  leagueName: string;
  leagueId: number;
  leaguePosition: number;
};

const buildCombinedRows = (
  premStandings: Standing[],
  champStandings: Standing[],
  entryMap: Map<number, LeagueEntry>,
  gwsPlayed: number,
): RowData[] => {
  const premRankMap = new Map(
    premStandings.map((s) => [s.league_entry, s.rank]),
  );

  const champRankMap = new Map(
    champStandings.map((s) => [s.league_entry, s.rank]),
  );

  const premIds = new Set(premStandings.map((s) => s.league_entry));

  const sorted = [...premStandings, ...champStandings]
    .slice()
    .sort((a, b) => b.total - a.total);

  return sorted.map((s, i) => {
    const entry = entryMap.get(s.league_entry);
    const isPrem = premIds.has(s.league_entry);
    return {
      leagueEntryId: s.league_entry,
      rank: i + 1,
      playerName: PARTICIPANT_BY_API_ID[s.league_entry]?.name ?? "Unknown",
      teamName: entry?.entry_name ?? "Unknown",
      total: s.total,
      gwScore: s.event_total,
      avg: gwsPlayed > 0 ? s.total / gwsPlayed : 0,
      leagueName: isPrem
        ? LEAGUE_LABELS.premiership
        : LEAGUE_LABELS.championship,
      leagueId: isPrem ? LEAGUE_IDS.PREMIERSHIP : LEAGUE_IDS.CHAMPIONSHIP,
      leaguePosition: isPrem
        ? (premRankMap.get(s.league_entry) ?? 0)
        : (champRankMap.get(s.league_entry) ?? 0),
    };
  });
};

export const CombinedLeagueTable = (): JSX.Element => {
  const trpc = useTRPC();
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  );
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({
      leagueId: LEAGUE_SLUG_TO_ID.championship,
    }),
  );
  const { data: bootstrap } = useSuspenseQuery(
    trpc.fpl.bootstrapStatic.queryOptions(),
  );

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(
    null,
  );

  const gwsPlayed = bootstrap.events.current - premData.league.start_event + 1;

  const entryMap = useMemo(() => {
    const map = new Map<number, LeagueEntry>();
    for (const e of premData.league_entries) map.set(e.id, e);
    for (const e of champData.league_entries) map.set(e.id, e);
    return map;
  }, [premData.league_entries, champData.league_entries]);

  const rows = useMemo(
    () =>
      buildCombinedRows(
        premData.standings,
        champData.standings,
        entryMap,
        gwsPlayed,
      ),
    [premData.standings, champData.standings, entryMap, gwsPlayed],
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            type="button"
            key={row.playerName}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
            onClick={() =>
              setSelectedPlayer({
                apiId: row.leagueEntryId,
                playerName: row.playerName,
                teamName: row.teamName,
                leagueName: row.leagueName,
                leagueId: row.leagueId,
                leaguePosition: row.leaguePosition,
                overallPosition: row.rank,
              })
            }
          >
            <RankBadge rank={row.rank} />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {row.playerName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {row.teamName}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-8">
              <div className="w-10 text-right">
                <p className="text-base font-bold tabular-nums text-muted-foreground">
                  {row.avg.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Avg Pts</p>
              </div>
              <div className="w-10 text-right">
                <p className="text-base font-black tabular-nums text-foreground">
                  {fmtPts(row.total)}
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
