"use client"

import { WheelLabel } from "@pbd/components/SpinTheWheel/WheelLabel"
import { WheelPeg } from "@pbd/components/SpinTheWheel/WheelPeg"
import { WheelSegment } from "@pbd/components/SpinTheWheel/WheelSegment"
import { WHEEL_VIEWBOX } from "@pbd/lib/wheelGeometry"
import { type MotionValue, motion } from "motion/react"
import type { JSX } from "react"

type WheelDiscProps = {
  challenges: readonly string[]
  rotation: MotionValue<number>
}

const SEGMENT_FILLS = [
  "fill-wheel-red",
  "fill-wheel-gold",
  "fill-wheel-green",
  "fill-wheel-blue",
  "fill-wheel-purple",
]

export const WheelDisc = ({ challenges, rotation }: WheelDiscProps): JSX.Element => (
  <motion.div className="absolute inset-0 z-0" style={{ rotate: rotation }}>
    <svg
      viewBox={WHEEL_VIEWBOX}
      className="h-full w-full"
      role="img"
      aria-label={`Wheel of challenges: ${challenges.join(", ")}`}
    >
      {challenges.map((challenge, index) => (
        <WheelSegment
          key={challenge}
          index={index}
          segmentCount={challenges.length}
          fillClassName={SEGMENT_FILLS[index % SEGMENT_FILLS.length]}
        />
      ))}

      {challenges.map((challenge, index) => (
        <WheelLabel
          key={challenge}
          label={challenge}
          index={index}
          segmentCount={challenges.length}
        />
      ))}

      {challenges.map((challenge, index) => (
        <WheelPeg key={challenge} index={index} segmentCount={challenges.length} />
      ))}
    </svg>
  </motion.div>
)
