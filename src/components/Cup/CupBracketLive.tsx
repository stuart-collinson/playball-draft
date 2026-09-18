"use client"

import { CupBracket } from "@pbd/components/Cup/CupBracket"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useCurrentGwToPlay } from "@pbd/hooks/fpl/useCurrentGwToPlay"
import { cupLiveFrom } from "@pbd/lib/cups/live"
import { COMBINED_SCOPE, getLeagueIds } from "@pbd/lib/leagues"
import type { CupFormat, CupSchedule, CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  ties: CupTie[]
  currentGameweek: number | null
}

const ALL_LEAGUE_IDS = getLeagueIds(COMBINED_SCOPE)

export const CupBracketLive = ({ format, schedule, ties, currentGameweek }: Props): JSX.Element => {
  const points = useCurrentGwPoints(ALL_LEAGUE_IDS)
  const toPlay = useCurrentGwToPlay(ALL_LEAGUE_IDS)

  return (
    <CupBracket
      format={format}
      schedule={schedule}
      ties={ties}
      live={cupLiveFrom(currentGameweek, points.data, toPlay.data)}
    />
  )
}
