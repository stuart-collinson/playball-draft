import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import type { PitchRow } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  rows: PitchRow[]
}

const SHRINK_CLASSES = "mx-auto max-w-[440px] [zoom:0.46] sm:[zoom:0.5] lg:[zoom:0.55]"

export const HomePitch = ({ rows }: Props): JSX.Element => (
  <div className={`w-full shrink-0 ${SHRINK_CLASSES}`}>
    <PitchSurface rows={rows} />
  </div>
)
