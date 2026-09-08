"use client"

import { ComicStripScreen } from "@pbd/components/Home/ComicStripScreen"
import { HomeScreenSkeleton } from "@pbd/components/Home/HomeScreenSkeleton"
import { NewspaperScreen } from "@pbd/components/Home/NewspaperScreen"
import { TeletextScreen } from "@pbd/components/Home/TeletextScreen"
import { SeasonCountdown } from "@pbd/components/SeasonCountdown"
import { useGameweekForfeits } from "@pbd/hooks/forfeits/useGameweekForfeits"
import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails"
import { useCurrentGwGoalsAndAssists } from "@pbd/hooks/fpl/useCurrentGwGoalsAndAssists"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import type { HomeScreenKey } from "@pbd/lib/constants/Home"
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { hasNoScoresYet, resolveLeagueOutcome } from "@pbd/lib/fpl/gameweekOutcome"
import type { GameweekForfeit } from "@pbd/lib/homeScreen"
import { resolveForfeitStatus } from "@pbd/lib/homeScreen"
import type { GoalsAndAssists, LeagueDetailsResponse } from "@pbd/types/fpl.types"
import type { HomeLeagueSnapshot, HomeSnapshot } from "@pbd/types/home.types"
import type { ComponentType, JSX } from "react"

type Props = {
  screen: HomeScreenKey
  canViewForfeits: boolean
}

type ScreenProps = {
  snapshot: HomeSnapshot
}

const SCREENS: Record<HomeScreenKey, ComponentType<ScreenProps>> = {
  comic: ComicStripScreen,
  newspaper: NewspaperScreen,
  teletext: TeletextScreen,
}

const buildLeagueSnapshot = (
  league: LeagueSlug,
  details: LeagueDetailsResponse,
  returns: Record<number, GoalsAndAssists>,
  livePoints: Record<number, number>,
  seasonOver: boolean,
  forfeits: GameweekForfeit[] | null,
): HomeLeagueSnapshot => {
  const outcome = resolveLeagueOutcome(details, returns, livePoints, seasonOver)
  return { ...outcome, forfeit: resolveForfeitStatus(outcome.loser, league, forfeits) }
}

export const HomeScreenBody = ({ screen, canViewForfeits }: Props): JSX.Element => {
  const { premData, champData } = useBothLeagueDetails()
  const { data: premReturns } = useCurrentGwGoalsAndAssists(LEAGUE_IDS.PREMIERSHIP)
  const { data: champReturns } = useCurrentGwGoalsAndAssists(LEAGUE_IDS.CHAMPIONSHIP)
  const { data: premPoints } = useCurrentGwPoints(LEAGUE_IDS.PREMIERSHIP)
  const { data: champPoints } = useCurrentGwPoints(LEAGUE_IDS.CHAMPIONSHIP)
  const { data: gameState, isPending: gameStatePending } = useGameState()
  const gameweek = gameState?.currentEvent ?? null
  const forfeits = useGameweekForfeits(gameweek, canViewForfeits)

  if (gameStatePending) return <HomeScreenSkeleton />

  const seasonOver = gameState?.seasonOver ?? false
  const livePoints = { ...premPoints, ...champPoints }
  const standings = [...premData.standings, ...champData.standings]

  if (gameweek === null || hasNoScoresYet(standings, livePoints, seasonOver))
    return <SeasonCountdown deadline={gameState?.nextDeadline ?? null} gameweek={gameweek} />

  const snapshot: HomeSnapshot = {
    gameweek,
    premiership: buildLeagueSnapshot(
      "premiership",
      premData,
      premReturns,
      premPoints,
      seasonOver,
      forfeits,
    ),
    championship: buildLeagueSnapshot(
      "championship",
      champData,
      champReturns,
      champPoints,
      seasonOver,
      forfeits,
    ),
  }
  const Screen = SCREENS[screen]

  return <Screen snapshot={snapshot} />
}
