"use client"

import { ResultOverlay } from "@pbd/components/SpinTheWheel/ResultOverlay"
import { Wheel } from "@pbd/components/SpinTheWheel/Wheel"
import { WheelResult } from "@pbd/components/SpinTheWheel/WheelResult"
import { useTickSound } from "@pbd/hooks/useTickSound"
import { WHEEL_CHALLENGES } from "@pbd/lib/constants/Wheel"
import { WHEEL_FULL_TURNS, createSpinOutcome, pegsPassed } from "@pbd/lib/wheel"
import { Volume2, VolumeX } from "lucide-react"
import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  useMotionValue,
  useReducedMotion,
} from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { JSX } from "react"
import "./SpinTheWheel.css"

type SpinStatus = "idle" | "spinning" | "landed" | "celebrating" | "done"

const SEGMENT_COUNT = WHEEL_CHALLENGES.length
const SPIN_DURATION_SECONDS = 5
const REDUCED_SPIN_DURATION_SECONDS = 0.6
const REDUCED_FULL_TURNS = 1
const SPIN_EASE: [number, number, number, number] = [0.1, 0.65, 0.1, 1]
const CELEBRATION_DELAY_MS = 1200
const POINTER_FLICK_DEGREES = 28
const POINTER_SPRING = { type: "spring", stiffness: 700, damping: 26 } as const

export const SpinTheWheel = (): JSX.Element => {
  const [status, setStatus] = useState<SpinStatus>("idle")
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null)
  const rotation = useMotionValue(0)
  const pointerAngle = useMotionValue(0)
  const lastPegRef = useRef(0)
  const spinAnimationRef = useRef<AnimationPlaybackControls | null>(null)
  const reducedMotion = useReducedMotion()
  const { muted, toggleMuted, unlockAudio, playTick } = useTickSound()

  const handleSpin = useCallback((): void => {
    if (status === "spinning") return

    unlockAudio()

    const startRotation = rotation.get()
    const fullTurns = reducedMotion ? REDUCED_FULL_TURNS : WHEEL_FULL_TURNS
    const outcome = createSpinOutcome(startRotation, SEGMENT_COUNT, fullTurns)

    lastPegRef.current = pegsPassed(startRotation, SEGMENT_COUNT)
    setWinnerLabel(null)
    setStatus("spinning")

    spinAnimationRef.current = animate(rotation, outcome.targetRotation, {
      duration: reducedMotion ? REDUCED_SPIN_DURATION_SECONDS : SPIN_DURATION_SECONDS,
      ease: reducedMotion ? "easeOut" : SPIN_EASE,
      onComplete: () => {
        setWinnerLabel(WHEEL_CHALLENGES[outcome.winnerIndex] ?? null)
        setStatus("landed")
      },
    })
  }, [status, unlockAudio, rotation, reducedMotion])

  useEffect(
    () =>
      rotation.on("change", (latest) => {
        const peg = pegsPassed(latest, SEGMENT_COUNT)
        if (peg <= lastPegRef.current) return

        lastPegRef.current = peg
        pointerAngle.jump(POINTER_FLICK_DEGREES)
        animate(pointerAngle, 0, POINTER_SPRING)
        playTick()
      }),
    [rotation, pointerAngle, playTick],
  )

  useEffect(() => {
    if (status !== "landed") return

    const timer = setTimeout(() => setStatus("celebrating"), CELEBRATION_DELAY_MS)

    return () => clearTimeout(timer)
  }, [status])

  useEffect(
    () => () => {
      spinAnimationRef.current?.stop()
    },
    [],
  )

  const dismissCelebration = useCallback((): void => setStatus("done"), [])

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-5">
      <Wheel
        rotation={rotation}
        pointerAngle={pointerAngle}
        spinning={status === "spinning"}
        onSpin={handleSpin}
      />

      <button
        type="button"
        onClick={toggleMuted}
        aria-pressed={muted}
        aria-label={muted ? "Unmute tick sound" : "Mute tick sound"}
        className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {muted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
      </button>

      <WheelResult spinning={status === "spinning"} winnerLabel={winnerLabel} />

      <AnimatePresence>
        {status === "celebrating" && winnerLabel && (
          <ResultOverlay label={winnerLabel} onDismiss={dismissCelebration} />
        )}
      </AnimatePresence>
    </div>
  )
}
