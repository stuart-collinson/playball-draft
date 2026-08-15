"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useBestWaivers } from "@pbd/hooks/fpl/useBestWaivers";
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps";
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge";
import PlayerDetails from "@pbd/components/Modals/PlayerDetails";
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl";
import type { PlayerDialogData } from "@pbd/types/player.types";
import { EmptyState } from "@pbd/components/EmptyState/EmptyState";

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
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(
    null,
  );

  const { data } = useBestWaivers({ leagueIds, sortBy, minGws, maxGws, limit });
  const { overallRankMap, leagueRankMap } = useRankMaps();

  if (data.length === 0)
    return (
      <EmptyState
        title="No Waivers Yet"
        message="Waiver signings appear once the season is under way."
      />
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
              <p className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                {entry.playerName}
                {entry.playerTeam && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {entry.playerTeam}
                  </span>
                )}
                <span
                  className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-bold leading-none ${
                    entry.kind === "f"
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-sky-500/20 text-sky-400"
                  }`}
                >
                  {entry.kind === "f" ? "FA" : "W"}
                </span>
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
