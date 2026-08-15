"use client"

import { WheelPointer } from "@pbd/components/SpinTheWheel/WheelPointer"
import { WHEEL_CHALLENGES } from "@pbd/lib/constants/Wheel"
import { cn } from "@pbd/lib/utils/cn"
import { splitLabelLines } from "@pbd/lib/wheel"
import { type MotionValue, motion } from "motion/react"
import type { JSX } from "react"

type WheelProps = {
  rotation: MotionValue<number>
  pointerAngle: MotionValue<number>
  spinning: boolean
  onSpin: () => void
}

const CENTRE = 200
const DISC_RADIUS = 172
const PEG_RADIUS = 164
const PEG_SIZE = 7
const RIM_RADIUS = 186
const RIM_WIDTH = 28
const HUB_RADIUS = 58
const BULB_COUNT = 20
const BULB_CORE_SIZE = 3.5
const BULB_HALO_SIZE = 7.5
const BULB_HALO_OPACITY = 0.25
const LABEL_RADIUS = 109
const LABEL_FONT_SIZE = 14
const LABEL_LINE_HEIGHT = 18
const COORDINATE_PRECISION = 1000

const SEGMENT_ANGLE = 360 / WHEEL_CHALLENGES.length
const BULB_ANGLE = 360 / BULB_COUNT

const SEGMENT_FILLS = [
  "fill-wheel-red",
  "fill-wheel-gold",
  "fill-wheel-green",
  "fill-wheel-blue",
  "fill-wheel-purple",
]

const toFixedPrecision = (value: number): number =>
  Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION

const polar = (radius: number, degrees: number): { x: number; y: number } => {
  const radians = (degrees * Math.PI) / 180

  return {
    x: toFixedPrecision(CENTRE + radius * Math.sin(radians)),
    y: toFixedPrecision(CENTRE - radius * Math.cos(radians)),
  }
}

const segmentPath = (index: number): string => {
  const start = polar(DISC_RADIUS, index * SEGMENT_ANGLE)
  const end = polar(DISC_RADIUS, (index + 1) * SEGMENT_ANGLE)

  return [
    `M ${CENTRE} ${CENTRE}`,
    `L ${start.x} ${start.y}`,
    `A ${DISC_RADIUS} ${DISC_RADIUS} 0 0 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

export const Wheel = ({ rotation, pointerAngle, spinning, onSpin }: WheelProps): JSX.Element => (
  <div className="relative aspect-square w-full">
    <motion.div className="absolute inset-0 z-0" style={{ rotate: rotation }}>
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        role="img"
        aria-label={`Wheel of challenges: ${WHEEL_CHALLENGES.join(", ")}`}
      >
        {WHEEL_CHALLENGES.map((challenge, index) => (
          <path
            key={challenge}
            d={segmentPath(index)}
            className={cn(SEGMENT_FILLS[index], "stroke-background")}
            strokeWidth={2}
          />
        ))}

        {WHEEL_CHALLENGES.map((challenge, index) => {
          const lines = splitLabelLines(challenge)
          const bisector = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
          const readsUpsideDown = bisector > 180
          const anchorX = CENTRE + LABEL_RADIUS

          return (
            <g key={challenge} transform={`rotate(${bisector - 90} ${CENTRE} ${CENTRE})`}>
              <g transform={readsUpsideDown ? `rotate(180 ${anchorX} ${CENTRE})` : undefined}>
                {lines.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={anchorX}
                    y={CENTRE + (lineIndex - (lines.length - 1) / 2) * LABEL_LINE_HEIGHT}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={LABEL_FONT_SIZE}
                    fontWeight={800}
                    className="fill-white stroke-black/40"
                    strokeWidth={2.5}
                    style={{ paintOrder: "stroke" }}
                  >
                    {line}
                  </text>
                ))}
              </g>
            </g>
          )
        })}

        {WHEEL_CHALLENGES.map((challenge, index) => {
          const peg = polar(PEG_RADIUS, index * SEGMENT_ANGLE)

          return (
            <circle
              key={`peg-${challenge}`}
              cx={peg.x}
              cy={peg.y}
              r={PEG_SIZE}
              className="fill-foreground stroke-background"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>
    </motion.div>

    <svg
      viewBox="0 0 400 400"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-hidden="true"
    >
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RIM_RADIUS}
        fill="none"
        className="stroke-wheel-rim"
        strokeWidth={RIM_WIDTH}
      />

      {Array.from({ length: BULB_COUNT }, (_, index) => index * BULB_ANGLE).map((angle, index) => {
        const bulb = polar(RIM_RADIUS, angle)

        return (
          <g key={angle} className={cn("wheel-bulb", index % 2 === 1 && "wheel-bulb-alt")}>
            <circle
              cx={bulb.x}
              cy={bulb.y}
              r={BULB_HALO_SIZE}
              className="fill-wheel-bulb"
              opacity={BULB_HALO_OPACITY}
            />
            <circle cx={bulb.x} cy={bulb.y} r={BULB_CORE_SIZE} className="fill-wheel-bulb" />
          </g>
        )
      })}

      <circle cx={CENTRE} cy={CENTRE} r={HUB_RADIUS} className="fill-wheel-rim" />
    </svg>

    <WheelPointer angle={pointerAngle} />

    <button
      type="button"
      onClick={onSpin}
      disabled={spinning}
      aria-label="Spin the wheel"
      className="absolute left-1/2 top-1/2 z-30 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg ring-4 ring-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70"
    >
      Spin
    </button>
  </div>
)
