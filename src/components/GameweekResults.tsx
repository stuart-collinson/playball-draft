"use client"

import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails"
import { useCurrentGwGoalsScored } from "@pbd/hooks/fpl/useCurrentGwGoalsScored"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { gameweekPointsFor } from "@pbd/lib/fpl/livePoints"
import type { GameweekResultType } from "@pbd/types"
import type { LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types"
import type { JSX } from "react"
import { GameweekResultsSkeleton } from "./GameweekResultsSkeleton"
import { LeagueTotals } from "./LeagueTotals"
import { ResultSection } from "./ResultSection"
import { SeasonCountdown } from "./SeasonCountdown"

const getExtremeStanding = (
  data: LeagueDetailsResponse,
  type: "winner" | "loser",
  goalsMap: Record<number, number>,
  pointsMap: Record<number, number>,
  seasonOver: boolean,
): GameweekResultType | null => {
  if (!data.standings.length) return null
  const gameweekPoints = (standing: Standing): number =>
    gameweekPointsFor(standing.event_total, pointsMap[standing.league_entry])
  const sorted = [...data.standings].sort((a, b) => {
    if (seasonOver) {
      return type === "winner" ? b.total - a.total : a.total - b.total
    }
    const pointsDiff =
      type === "winner"
        ? gameweekPoints(b) - gameweekPoints(a)
        : gameweekPoints(a) - gameweekPoints(b)
    if (pointsDiff !== 0) return pointsDiff
    const aGoals = goalsMap[a.league_entry] ?? 0
    const bGoals = goalsMap[b.league_entry] ?? 0
    return type === "winner" ? bGoals - aGoals : aGoals - bGoals
  })
  const standing = sorted[0] as Standing
  const entry = data.league_entries.find((e) => e.id === standing.league_entry)
  const participant = entry ? PARTICIPANT_BY_API_ID[entry.id] : null
  return {
    name:
      participant?.nickname ??
      participant?.name ??
      (entry ? `${entry.player_first_name} ${entry.player_last_name}` : "Unknown"),
    points: seasonOver ? standing.total : gameweekPoints(standing),
    image: participant?.image ?? null,
  }
}

export const GameweekResults = (): JSX.Element => {
  const { premData, champData } = useBothLeagueDetails()
  const { data: premGoals } = useCurrentGwGoalsScored(LEAGUE_IDS.PREMIERSHIP)
  const { data: champGoals } = useCurrentGwGoalsScored(LEAGUE_SLUG_TO_ID.championship)
  const { data: premPoints } = useCurrentGwPoints(LEAGUE_IDS.PREMIERSHIP)
  const { data: champPoints } = useCurrentGwPoints(LEAGUE_SLUG_TO_ID.championship)
  const { data: gameState, isPending: gameStatePending } = useGameState()

  if (gameStatePending) return <GameweekResultsSkeleton />

  const seasonOver = gameState?.seasonOver ?? false

  const livePoints = { ...premPoints, ...champPoints }
  const scores = [...premData.standings, ...champData.standings]
  const noScoresYet =
    !seasonOver &&
    scores.every(
      (standing) =>
        gameweekPointsFor(standing.event_total, livePoints[standing.league_entry]) === 0,
    )

  if (gameState?.currentEvent === null || noScoresYet)
    return (
      <SeasonCountdown
        deadline={gameState?.nextDeadline ?? null}
        gameweek={gameState?.currentEvent ?? null}
      />
    )

  const premTotal = premData.standings.reduce((sum, s) => sum + s.total, 0)
  const champTotal = champData.standings.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="animate-fade-up-delay-2 flex flex-col gap-4">
      <LeagueTotals premTotal={premTotal} champTotal={champTotal} />
      <ResultSection
        type="winner"
        premResult={getExtremeStanding(premData, "winner", premGoals, premPoints, seasonOver)}
        champResult={getExtremeStanding(champData, "winner", champGoals, champPoints, seasonOver)}
      />
      <ResultSection
        type="loser"
        premResult={getExtremeStanding(premData, "loser", premGoals, premPoints, seasonOver)}
        champResult={getExtremeStanding(champData, "loser", champGoals, champPoints, seasonOver)}
      />
    </div>
  )
}
