"use client"

import { LoserAvatar } from "@pbd/components/RootLayout/LoserAvatar"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { useGameweekSnapshot } from "@pbd/hooks/fpl/useGameweekSnapshot"
import { hasNoScoresYet, resolveLeagueOutcome } from "@pbd/lib/fpl/gameweekOutcome"
import type { GoalsAndAssists, LeagueDetailsResponse } from "@pbd/types/fpl.types"
import type { JSX } from "react"

export const GameweekLosers = (): JSX.Element => {
  const {
    premDetails: { data: premData },
    champDetails: { data: champData },
    premReturns: { data: premReturns },
    champReturns: { data: champReturns },
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
    returns: Record<number, GoalsAndAssists> | undefined,
    points: Record<number, number> | undefined,
  ): string | null =>
    data
      ? (resolveLeagueOutcome(data, returns ?? {}, points ?? {}, seasonOver).loser?.image ?? null)
      : null

  const premImage = loserImage(premData, premReturns, premPoints)
  const champImage = loserImage(champData, champReturns, champPoints)

  if (noScoresYet) return <div className="flex items-center gap-2" />

  return (
    <div className="flex items-center gap-2">
      {premData ? (
        premImage && <LoserAvatar imageUrl={premImage} />
      ) : (
        <Skeleton className="h-12 w-12 rounded-full" />
      )}
      {champData ? (
        champImage && <LoserAvatar imageUrl={champImage} />
      ) : (
        <Skeleton className="h-12 w-12 rounded-full" />
      )}
    </div>
  )
}
