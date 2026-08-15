import { WHEEL_CENTRE, segmentBisectorAngle, splitLabelLines } from "@pbd/lib/wheelGeometry"
import type { JSX } from "react"

type WheelLabelProps = {
  label: string
  index: number
  segmentCount: number
}

const LABEL_RADIUS = 109
const LABEL_FONT_SIZE = 14
const LABEL_LINE_HEIGHT = 18
const LABEL_STROKE_WIDTH = 2.5
const UPRIGHT_LIMIT_DEGREES = 180

export const WheelLabel = ({ label, index, segmentCount }: WheelLabelProps): JSX.Element => {
  const lines = splitLabelLines(label)
  const bisector = segmentBisectorAngle(index, segmentCount)
  const readsUpsideDown = bisector > UPRIGHT_LIMIT_DEGREES
  const anchorX = WHEEL_CENTRE + LABEL_RADIUS

  return (
    <g transform={`rotate(${bisector - 90} ${WHEEL_CENTRE} ${WHEEL_CENTRE})`}>
      <g transform={readsUpsideDown ? `rotate(180 ${anchorX} ${WHEEL_CENTRE})` : undefined}>
        {lines.map((line, lineIndex) => (
          <text
            key={line}
            x={anchorX}
            y={WHEEL_CENTRE + (lineIndex - (lines.length - 1) / 2) * LABEL_LINE_HEIGHT}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={LABEL_FONT_SIZE}
            fontWeight={800}
            className="fill-white stroke-black/40"
            strokeWidth={LABEL_STROKE_WIDTH}
            style={{ paintOrder: "stroke" }}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  )
}
