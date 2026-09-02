"use client"

import { ResultAvatar } from "@pbd/components/ResultAvatar"
import { ResultAvatarSkeleton } from "@pbd/components/ResultAvatarSkeleton"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { useGameweekSnapshot } from "@pbd/hooks/fpl/useGameweekSnapshot"
import { hasNoScoresYet, resolveLeagueOutcome } from "@pbd/lib/fpl/gameweekOutcome"
import type { LeagueDetailsResponse } from "@pbd/types/fpl.types"
import type { JSX } from "react"

export const GameweekLosers = (): JSX.Element => {
  const {
    premDetails: { data: premData },
    champDetails: { data: champData },
    premGoals: { data: premGoals },
    champGoals: { data: champGoals },
    premPoints: { data: premPoints },
    champPoints: { data: champPoints },
  } = useGameweekSnapshot()
  const { data: gameState } = useGameState()
  const seasonOver = gameState?.seasonOver ?? false
  const livePoints = { ...premPoints, ...champPoints }
  const standings = [...(premData?.standings ?? []), ...(champData?.standings ?? [])]
  const noScoresYet =
    gameState?.currentEvent === null ||
    (standings.length > 0 && hasNoScoresYet(standings, livePoints, seasonOver))

  const loserImage = (
    data: LeagueDetailsResponse | undefined,
    goals: Record<number, number> | undefined,
    points: Record<number, number> | undefined,
  ): string | null =>
    data
      ? (resolveLeagueOutcome(data, goals ?? {}, points ?? {}, seasonOver).loser?.image ?? null)
      : null

  const premImage = loserImage(premData, premGoals, premPoints)
  const champImage = loserImage(champData, champGoals, champPoints)

  if (noScoresYet) return <div className="flex items-center gap-2" />

  return (
    <div className="flex items-center gap-2">
      {premData ? (
        premImage && <ResultAvatar imageUrl={premImage} type="loser" size="md" />
      ) : (
        <ResultAvatarSkeleton />
      )}
      {champData ? (
        champImage && <ResultAvatar imageUrl={champImage} type="loser" size="md" />
      ) : (
        <ResultAvatarSkeleton />
      )}
    </div>
  )
}
