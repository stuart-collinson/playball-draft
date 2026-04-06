"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useTRPC } from "@pbd/trpc/react";
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge";
import PlayerDetails from "@pbd/components/Modals/PlayerDetails";
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl";
import type { PlayerDialogData } from "@pbd/types/player.types";

type Props = {
  leagueIds: number[];
  sortBy: "total" | "avg";
  minGws?: number;
  maxGws?: number;
  limit?: number;
};

export const BestWaiversTable = ({
  leagueIds,
  sortBy,
  minGws,
  maxGws,
  limit,
}: Props): JSX.Element => {
  const trpc = useTRPC();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(
    null,
  );

  const { data } = useSuspenseQuery(
    trpc.fpl.bestWaivers.queryOptions({
      leagueIds,
      sortBy,
      minGws,
      maxGws,
      limit,
    }),
  );
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  );
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP }),
  );

  const overallRankMap = useMemo(() => {
    const combined = [...premData.standings, ...champData.standings]
      .slice()
      .sort((a, b) => b.total - a.total);
    return new Map(combined.map((s, i) => [s.league_entry, i + 1]));
  }, [premData.standings, champData.standings]);

  const leagueRankMap = useMemo(
    () =>
      new Map(
        [...premData.standings, ...champData.standings].map((s) => [
          s.league_entry,
          s.rank,
        ]),
      ),
    [premData.standings, champData.standings],
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.map((entry, i) => (
          <button
            type="button"
            key={`${entry.playerName}-${entry.managerName}-${entry.acquiredEvent}`}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
            onClick={() =>
              setSelectedPlayer({
                apiId: entry.entryApiId,
                playerName: entry.managerName,
                teamName: entry.teamName,
                leagueName:
                  entry.leagueId === LEAGUE_IDS.PREMIERSHIP
                    ? LEAGUE_LABELS.premiership
                    : LEAGUE_LABELS.championship,
                leagueId: entry.leagueId,
                leaguePosition: leagueRankMap.get(entry.entryApiId) ?? 0,
                overallPosition: overallRankMap.get(entry.entryApiId) ?? 0,
              })
            }
          >
            <RankBadge rank={i + 1} />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {entry.playerName}
                {entry.playerTeam && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {entry.playerTeam}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.managerName} · {entry.teamName}
              </p>
            </div>

            <div className="w-24 shrink-0 text-center">
              <p className="text-sm font-medium tabular-nums text-muted-foreground">
                GW{entry.acquiredEvent}
                {entry.droppedEvent !== null
                  ? `–${entry.droppedEvent - 1}`
                  : "+"}
              </p>
            </div>

            <div className="w-12 shrink-0 text-right">
              <p className="text-base font-black tabular-nums text-foreground">
                {sortBy === "avg" ? entry.avgPoints.toFixed(1) : entry.points}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                {sortBy === "avg" ? "PPG" : "Points"}
              </p>
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
