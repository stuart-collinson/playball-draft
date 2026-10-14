"use client"

import { CupFinalStage } from "@pbd/components/Home/CupFinal/CupFinalStage"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useCurrentGwToPlay } from "@pbd/hooks/fpl/useCurrentGwToPlay"
import { finalLineups } from "@pbd/lib/cups/final"
import { cupLiveFrom, cupTieView } from "@pbd/lib/cups/live"
import { COMBINED_SCOPE, getLeagueIds } from "@pbd/lib/leagues"
import type { ResolvedCup } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  cup: ResolvedCup
  gameweek: number
}

const ALL_LEAGUE_IDS = getLeagueIds(COMBINED_SCOPE)

export const CupFinalMatch = ({ cup, gameweek }: Props): JSX.Element => {
  const points = useCurrentGwPoints(ALL_LEAGUE_IDS)
  const toPlay = useCurrentGwToPlay(ALL_LEAGUE_IDS)

  const tie = cup.ties.find((candidate) => candidate.round === "final") ?? null
  const live = cupLiveFrom(gameweek, points.data, toPlay.data)
  const lineups = finalLineups(cup.cup.schedule.final, gameweek)

  return (
    <CupFinalStage
      cupName={cup.cup.name}
      tie={tie}
      view={tie ? cupTieView(tie, live) : null}
      lineupGameweek={lineups.gameweek}
      showPoints={lineups.isConfirmed}
      notice={null}
    />
  )
}
