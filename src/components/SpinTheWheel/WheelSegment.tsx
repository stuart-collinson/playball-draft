import { cn } from "@pbd/lib/className"
import { segmentPath } from "@pbd/lib/wheel/geometry"
import type { JSX } from "react"

type WheelSegmentProps = {
  index: number
  segmentCount: number
  fillClassName: string | undefined
}

const SEPARATOR_WIDTH = 2

export const WheelSegment = ({
  index,
  segmentCount,
  fillClassName,
}: WheelSegmentProps): JSX.Element => (
  <path
    d={segmentPath(index, segmentCount)}
    className={cn(fillClassName, "stroke-background")}
    strokeWidth={SEPARATOR_WIDTH}
  />
)
