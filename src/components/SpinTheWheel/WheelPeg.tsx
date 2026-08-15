import { polar, segmentBoundaryAngle } from "@pbd/lib/wheelGeometry"
import type { JSX } from "react"

type WheelPegProps = {
  index: number
  segmentCount: number
}

const PEG_RADIUS = 164
const PEG_SIZE = 7
const PEG_STROKE_WIDTH = 1.5

export const WheelPeg = ({ index, segmentCount }: WheelPegProps): JSX.Element => {
  const position = polar(PEG_RADIUS, segmentBoundaryAngle(index, segmentCount))

  return (
    <circle
      cx={position.x}
      cy={position.y}
      r={PEG_SIZE}
      className="fill-foreground stroke-background"
      strokeWidth={PEG_STROKE_WIDTH}
    />
  )
}
