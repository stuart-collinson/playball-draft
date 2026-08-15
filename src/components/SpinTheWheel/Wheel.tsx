"use client"

import { SpinButton } from "@pbd/components/SpinTheWheel/SpinButton"
import { WheelDisc } from "@pbd/components/SpinTheWheel/WheelDisc"
import { WheelPointer } from "@pbd/components/SpinTheWheel/WheelPointer"
import { WheelRim } from "@pbd/components/SpinTheWheel/WheelRim"
import type { MotionValue } from "motion/react"
import type { JSX } from "react"

type WheelProps = {
  challenges: readonly string[]
  rotation: MotionValue<number>
  pointerAngle: MotionValue<number>
  spinning: boolean
  onSpin: () => void
}

export const Wheel = ({
  challenges,
  rotation,
  pointerAngle,
  spinning,
  onSpin,
}: WheelProps): JSX.Element => (
  <div className="relative aspect-square w-full">
    <WheelDisc challenges={challenges} rotation={rotation} />
    <WheelRim />
    <WheelPointer angle={pointerAngle} />
    <SpinButton disabled={spinning} onSpin={onSpin} />
  </div>
)
