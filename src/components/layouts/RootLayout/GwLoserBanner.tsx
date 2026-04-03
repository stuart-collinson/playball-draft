"use client"

import { useQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { ResultAvatar } from "@pbd/components/ResultAvatar"
import { useTRPC } from "@pbd/trpc/react"

const AvatarSkeleton = (): JSX.Element => (
  <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
)

export const GwLoserBanner = (): JSX.Element => {
  const trpc = useTRPC()

  const { data: premData } = useQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  )
  const { data: champData } = useQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID.championship }),
  )

  const getLoserImage = (data: typeof premData): string | null => {
    if (!data) return null
    const sorted = [...data.standings].sort((a, b) => a.event_total - b.event_total)
    const loser = sorted[0]
    if (!loser) return null
    return PARTICIPANT_BY_API_ID[loser.league_entry]?.image ?? null
  }

  const premImage = getLoserImage(premData)
  const champImage = getLoserImage(champData)

  return (
    <div className="flex items-center gap-2">
      {premData ? (
        premImage && <ResultAvatar imageUrl={premImage} type="loser" />
      ) : (
        <AvatarSkeleton />
      )}
      {champData ? (
        champImage && <ResultAvatar imageUrl={champImage} type="loser" />
      ) : (
        <AvatarSkeleton />
      )}
    </div>
  )
}
