"use client"

import { WHEEL_FULL_TURNS, createSpinOutcome, pegsPassed } from "@pbd/lib/wheel"
import {
  type AnimationPlaybackControls,
  type MotionValue,
  animate,
  useMotionValue,
  useReducedMotion,
} from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

type SpinStatus = "idle" | "spinning" | "landed" | "celebrating" | "done"

type UseWheelSpinArgs = {
  challenges: readonly string[]
  onSpinStart: () => void
  onPegPass: () => void
}

type UseWheelSpinReturn = {
  status: SpinStatus
  winnerLabel: string | null
  rotation: MotionValue<number>
  pointerAngle: MotionValue<number>
  spin: () => void
  dismissCelebration: () => void
}

const SPIN_DURATION_SECONDS = 7.5
const REDUCED_SPIN_DURATION_SECONDS = 0.6
const REDUCED_FULL_TURNS = 1
const SPIN_EASE: [number, number, number, number] = [0.2, 0.7, 0.55, 1]
const CELEBRATION_DELAY_MS = 1200
const POINTER_DRAG_DEGREES = -28
const POINTER_SPRING = { type: "spring", stiffness: 700, damping: 26 } as const

export const useWheelSpin = ({
  challenges,
  onSpinStart,
  onPegPass,
}: UseWheelSpinArgs): UseWheelSpinReturn => {
  const [status, setStatus] = useState<SpinStatus>("idle")
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null)
  const rotation = useMotionValue(0)
  const pointerAngle = useMotionValue(0)
  const lastPegRef = useRef(0)
  const spinAnimationRef = useRef<AnimationPlaybackControls | null>(null)
  const reducedMotion = useReducedMotion()

  const onSpinStartRef = useRef(onSpinStart)
  const onPegPassRef = useRef(onPegPass)

  onSpinStartRef.current = onSpinStart
  onPegPassRef.current = onPegPass

  const segmentCount = challenges.length

  const spin = useCallback((): void => {
    if (status === "spinning") return

    onSpinStartRef.current()

    const startRotation = rotation.get()
    const fullTurns = reducedMotion ? REDUCED_FULL_TURNS : WHEEL_FULL_TURNS
    const outcome = createSpinOutcome(startRotation, segmentCount, fullTurns)

    lastPegRef.current = pegsPassed(startRotation, segmentCount)
    setWinnerLabel(null)
    setStatus("spinning")

    spinAnimationRef.current = animate(rotation, outcome.targetRotation, {
      duration: reducedMotion ? REDUCED_SPIN_DURATION_SECONDS : SPIN_DURATION_SECONDS,
      ease: reducedMotion ? "easeOut" : SPIN_EASE,
      onComplete: () => {
        setWinnerLabel(challenges[outcome.winnerIndex] ?? null)
        setStatus("landed")
      },
    })
  }, [status, rotation, reducedMotion, segmentCount, challenges])

  useEffect(
    () =>
      rotation.on("change", (latest) => {
        const peg = pegsPassed(latest, segmentCount)
        if (peg <= lastPegRef.current) return

        lastPegRef.current = peg
        pointerAngle.jump(POINTER_DRAG_DEGREES)
        animate(pointerAngle, 0, POINTER_SPRING)
        onPegPassRef.current()
      }),
    [rotation, pointerAngle, segmentCount],
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

  return { status, winnerLabel, rotation, pointerAngle, spin, dismissCelebration }
}
