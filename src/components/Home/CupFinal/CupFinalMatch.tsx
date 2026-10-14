"use client"

import { CupFinalStage } from "@pbd/components/Home/CupFinal/CupFinalStage"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useCurrentGwToPlay } from "@pbd/hooks/fpl/useCurrentGwToPlay"
import { cupLiveFrom, cupTieView } from "@pbd/lib/cups/live"
import { COMBINED_SCOPE, getLeagueIds } from "@pbd/lib/leagues"
import type { ResolvedCup } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  cup: ResolvedCup
}

const ALL_LEAGUE_IDS = getLeagueIds(COMBINED_SCOPE)

export const CupFinalMatch = ({ cup }: Props): JSX.Element => {
  const points = useCurrentGwPoints(ALL_LEAGUE_IDS)
  const toPlay = useCurrentGwToPlay(ALL_LEAGUE_IDS)

  const tie = cup.ties.find((candidate) => candidate.round === "final") ?? null
  const live = cupLiveFrom(cup.currentGameweek, points.data, toPlay.data)
  const isFinalGameweek = tie?.legs.some((leg) => leg.gameweek === cup.currentGameweek) ?? false

  return (
    <CupFinalStage
      cupName={cup.cup.name}
      tie={tie}
      view={tie ? cupTieView(tie, live) : null}
      showPoints={isFinalGameweek}
      notice={null}
    />
  )
}
