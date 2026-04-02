"use client"

import { useQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { useTRPC } from "@pbd/trpc/react"

const LOSER_EMOJI = "🪵"

type LoserChipProps = {
  label: string
  managerName: string
  points: number
  colorClass: string
}

const LoserChip = ({ label, managerName, points, colorClass }: LoserChipProps): JSX.Element => (
  <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
    <span>{LOSER_EMOJI}</span>
    <span className="hidden sm:inline">{label} · </span>
    <span className="max-w-[80px] truncate sm:max-w-none">{managerName.split(" ")[0]}</span>
    <span className="font-bold">{points}pts</span>
  </div>
)

const LoserChipSkeleton = (): JSX.Element => (
  <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
)

export const GwLoserBanner = (): JSX.Element => {
  const trpc = useTRPC()

  const { data: premData } = useQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  )
  const { data: champData } = useQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID.championship }),
  )

  const getLoser = (data: typeof premData) => {
    if (!data) return null
    const sorted = [...data.standings].sort((a, b) => a.event_total - b.event_total)
    const loser = sorted[0]
    if (!loser) return null
    const entry = data.league_entries.find((e) => e.id === loser.league_entry)
    return {
      managerName: entry ? `${entry.player_first_name} ${entry.player_last_name}` : "Unknown",
      points: loser.event_total,
    }
  }

  const premLoser = getLoser(premData)
  const champLoser = getLoser(champData)

  return (
    <div className="flex items-center gap-2">
      {premLoser ? (
        <LoserChip
          label="Prem"
          managerName={premLoser.managerName}
          points={premLoser.points}
          colorClass="bg-prem-900 text-prem-400"
        />
      ) : (
        <LoserChipSkeleton />
      )}
      {champLoser ? (
        <LoserChip
          label="Champ"
          managerName={champLoser.managerName}
          points={champLoser.points}
          colorClass="bg-champ-900 text-champ-400"
        />
      ) : (
        <LoserChipSkeleton />
      )}
    </div>
  )
}
