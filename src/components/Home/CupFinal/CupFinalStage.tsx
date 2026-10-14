import { CupFinalCentrepiece } from "@pbd/components/Home/CupFinal/CupFinalCentrepiece"
import { CupFinalFinalist } from "@pbd/components/Home/CupFinal/CupFinalFinalist"
import { CupFinalHeader } from "@pbd/components/Home/CupFinal/CupFinalHeader"
import { CupFinalPitch } from "@pbd/components/Home/CupFinal/CupFinalPitch"
import { CupFinalTickerTape } from "@pbd/components/Home/CupFinal/CupFinalTickerTape"
import type { CupTieView } from "@pbd/lib/cups/live"
import type { CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  cupName: string | null
  tie: CupTie | null
  view: CupTieView | null
  lineupGameweek: number
  showPoints: boolean
  notice: string | null
}

export const CupFinalStage = ({
  cupName,
  tie,
  view,
  lineupGameweek,
  showPoints,
  notice,
}: Props): JSX.Element => {
  const winner = tie?.winner ?? null

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3">
      {winner && <CupFinalTickerTape />}
      <CupFinalHeader cupName={cupName} gameweek={tie?.legs[0]?.gameweek ?? null} />
      <div className="relative grid shrink-0 grid-cols-[1fr_auto_1fr] items-start gap-1">
        <CupFinalFinalist
          person={tie?.personOne ?? null}
          toPlay={view?.toPlayOne ?? null}
          winner={winner}
          side="one"
        />
        <CupFinalCentrepiece tie={tie} view={view} notice={notice} />
        <CupFinalFinalist
          person={tie?.personTwo ?? null}
          toPlay={view?.toPlayTwo ?? null}
          winner={winner}
          side="two"
        />
      </div>
      <CupFinalPitch
        personOne={tie?.personOne ?? null}
        personTwo={tie?.personTwo ?? null}
        lineupGameweek={lineupGameweek}
        showPoints={showPoints}
      />
    </div>
  )
}
