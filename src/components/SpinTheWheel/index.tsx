"use client"

import { MuteToggle } from "@pbd/components/SpinTheWheel/MuteToggle"
import { ResultOverlay } from "@pbd/components/SpinTheWheel/ResultOverlay"
import { Wheel } from "@pbd/components/SpinTheWheel/Wheel"
import { WheelResult } from "@pbd/components/SpinTheWheel/WheelResult"
import { useTickSound } from "@pbd/hooks/useTickSound"
import { useWheelSpin } from "@pbd/hooks/useWheelSpin"
import { WHEEL_CHALLENGES } from "@pbd/lib/constants/Wheel"
import { AnimatePresence } from "motion/react"
import type { JSX } from "react"
import "@pbd/components/SpinTheWheel/SpinTheWheel.css"

export const SpinTheWheel = (): JSX.Element => {
  const { muted, toggleMuted, unlockAudio, playTick } = useTickSound()
  const { status, winnerLabel, rotation, pointerAngle, spin, dismissCelebration } = useWheelSpin({
    challenges: WHEEL_CHALLENGES,
    onSpinStart: unlockAudio,
    onPegPass: playTick,
  })

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-5">
      <Wheel
        challenges={WHEEL_CHALLENGES}
        rotation={rotation}
        pointerAngle={pointerAngle}
        spinning={status === "spinning"}
        onSpin={spin}
      />

      <MuteToggle muted={muted} onToggle={toggleMuted} />

      <WheelResult spinning={status === "spinning"} winnerLabel={winnerLabel} />

      <AnimatePresence>
        {status === "celebrating" && winnerLabel && (
          <ResultOverlay label={winnerLabel} onDismiss={dismissCelebration} />
        )}
      </AnimatePresence>
    </div>
  )
}
