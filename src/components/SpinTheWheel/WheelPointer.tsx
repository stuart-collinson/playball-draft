"use client"

import { type MotionValue, motion } from "motion/react"
import type { JSX } from "react"

type WheelPointerProps = {
  angle: MotionValue<number>
}

export const WheelPointer = ({ angle }: WheelPointerProps): JSX.Element => (
  <motion.div
    className="pointer-events-none absolute left-1/2 top-0 z-20 w-[14%] origin-top -translate-x-1/2"
    style={{ rotate: angle }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 48 40" className="h-full w-full" aria-hidden="true">
      <path
        d="M 24 37 L 5 3 L 43 3 Z"
        className="fill-wheel-bulb stroke-wheel-rim"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <circle cx={24} cy={6} r={4} className="fill-wheel-rim" />
    </svg>
  </motion.div>
)
