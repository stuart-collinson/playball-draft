"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge"
import PlayerDetails from "@pbd/components/Modals/PlayerDetails"
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useState } from "react"

export type ManagerStatRow = {
  rank: number
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  primary: { value: string; label: string }
  detail?: string
}

type Props = {
  rows: ManagerStatRow[]
  emptyTitle: string
  emptyMessage: string
}

export const ManagerStatList = ({ rows, emptyTitle, emptyMessage }: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(null)
  const { leagueRankMap } = useRankMaps()

  if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            type="button"
            key={row.entryApiId}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
            onClick={() =>
              setSelectedPlayer({
                apiId: row.entryApiId,
                playerName: row.managerName,
                teamName: row.teamName,
                leagueName:
                  row.leagueId === LEAGUE_IDS.PREMIERSHIP
                    ? LEAGUE_LABELS.premiership
                    : LEAGUE_LABELS.championship,
                leagueId: row.leagueId,
                leaguePosition: leagueRankMap.get(row.entryApiId) ?? 0,
                overallPosition: row.rank,
              })
            }
          >
            <RankBadge rank={row.rank} />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{row.managerName}</p>
              <p className="truncate text-xs text-muted-foreground">{row.teamName}</p>
              {row.detail && (
                <p className="truncate text-xs tabular-nums text-muted-foreground/80">
                  {row.detail}
                </p>
              )}
            </div>

            <div className="w-16 shrink-0 text-right">
              <p className="text-base font-black tabular-nums text-foreground">
                {row.primary.value}
              </p>
              <p className="text-[10px] text-muted-foreground/60">{row.primary.label}</p>
            </div>
          </button>
        ))}
      </div>

      <PlayerDetails
        open={selectedPlayer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedPlayer(null)
        }}
        player={selectedPlayer}
      />
    </>
  )
}
