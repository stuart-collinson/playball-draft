"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails";
import { useGwCountsTable } from "@pbd/hooks/fpl/useGwCountsTable";
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps";
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge";
import PlayerDetails from "@pbd/components/Modals/PlayerDetails";
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl";
import type { PlayerDialogData } from "@pbd/types/player.types";
import { EmptyState } from "@pbd/components/EmptyState/EmptyState";

type Props = {
  leagueIds: number[];
  type: "relevancy" | "gw-wins" | "gw-losses";
};

const VALUE_LABEL: Record<Props["type"], string> = {
  relevancy: "Total",
  "gw-wins": "Wins",
  "gw-losses": "Losses",
};

export const GwCountsTable = ({ leagueIds, type }: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(
    null,
  );

  const { data } = useGwCountsTable({ leagueIds, type });
  const { premData, champData } = useBothLeagueDetails();
  const { leagueRankMap } = useRankMaps();

  if (data.length === 0)
    return (
      <EmptyState
        title="No Gameweek Data Yet"
        message="This fills in once the first gameweek is complete."
      />
    );

  const leagueIdMap = new Map([
    ...premData.standings.map(
      (s) => [s.league_entry, LEAGUE_IDS.PREMIERSHIP] as const,
    ),
    ...champData.standings.map(
      (s) => [s.league_entry, LEAGUE_IDS.CHAMPIONSHIP] as const,
    ),
  ]);

  const valueLabel = VALUE_LABEL[type];

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.map((entry) => {
          const value =
            type === "relevancy"
              ? entry.gwWins + entry.gwLosses
              : type === "gw-wins"
                ? entry.gwWins
                : entry.gwLosses;

          return (
            <button
              type="button"
              key={entry.entryApiId}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
              onClick={() =>
                setSelectedPlayer({
                  apiId: entry.entryApiId,
                  playerName: entry.managerName,
                  teamName: entry.teamName,
                  leagueName:
                    leagueIdMap.get(entry.entryApiId) === LEAGUE_IDS.PREMIERSHIP
                      ? LEAGUE_LABELS.premiership
                      : LEAGUE_LABELS.championship,
                  leagueId:
                    leagueIdMap.get(entry.entryApiId) ?? leagueIds[0] ?? 0,
                  leaguePosition: leagueRankMap.get(entry.entryApiId) ?? 0,
                  overallPosition: entry.rank,
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

              <div className="w-12 shrink-0 text-right">
                <p className="text-base font-black tabular-nums text-foreground">
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {valueLabel}
                </p>
              </div>
            </button>
          );
        })}
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
