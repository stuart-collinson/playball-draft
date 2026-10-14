import { CupFinalPlayer } from "@pbd/components/Home/CupFinal/CupFinalPlayer"
import type { CupFinalSide } from "@pbd/types/home.types"
import type { PitchRow } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  rows: PitchRow[] | null
  side: CupFinalSide
  showPoints: boolean
}

export const CupFinalHalf = ({ rows, side, showPoints }: Props): JSX.Element => (
  <div className="relative z-10 grid flex-1 auto-cols-fr grid-flow-col px-1.5 py-2">
    {rows?.map((row) => (
      <div key={row.key} className="flex min-w-0 flex-col items-center justify-evenly">
        {row.players.map((player) => (
          <CupFinalPlayer key={player.key} player={player} side={side} showPoints={showPoints} />
        ))}
      </div>
    ))}
  </div>
)
