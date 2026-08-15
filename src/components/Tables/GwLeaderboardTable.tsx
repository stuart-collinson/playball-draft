"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useGwLeaderboard } from "@pbd/hooks/fpl/useGwLeaderboard";
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps";
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge";
import PlayerDetails from "@pbd/components/Modals/PlayerDetails";
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl";
import type { PlayerDialogData } from "@pbd/types/player.types";

type Props = {
  leagueIds: number[];
  type: "best" | "worst";
};

export const GwLeaderboardTable = ({ leagueIds, type }: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(
    null,
  );

  const { data } = useGwLeaderboard({ leagueIds, type });
  const { overallRankMap, leagueRankMap } = useRankMaps();

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.map((entry) => (
          <button
            type="button"
            key={`${entry.managerName}-${entry.event}-${entry.points}`}
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
            <RankBadge rank={entry.rank} />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {entry.managerName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.teamName}
              </p>
            </div>

            <div className="w-16 shrink-0 text-center">
              <p className="text-sm font-medium tabular-nums text-muted-foreground">
                GW{entry.event}
              </p>
            </div>

            <div className="w-12 shrink-0 text-right">
              <p className="text-base font-black tabular-nums text-foreground">
                {entry.points}
              </p>
              <p className="text-[10px] text-muted-foreground/60">Points</p>
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
