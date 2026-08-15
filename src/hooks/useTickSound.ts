"use client"

import { useToggle } from "@pbd/hooks/useToggle"
import { useCallback, useEffect, useRef } from "react"

type UseTickSoundReturn = {
  muted: boolean
  toggleMuted: () => void
  unlockAudio: () => void
  playTick: () => void
}

const TICK_FREQUENCY_HZ = 1900
const TICK_PEAK_GAIN = 0.15
const TICK_FADE_GAIN = 0.0001
const TICK_FADE_SECONDS = 0.045
const TICK_STOP_SECONDS = 0.05

export const useTickSound = (): UseTickSoundReturn => {
  const [muted, toggleMuted] = useToggle(false)
  const contextRef = useRef<AudioContext | null>(null)
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const unlockAudio = useCallback((): void => {
    contextRef.current ??= new AudioContext()
    if (contextRef.current.state === "suspended") void contextRef.current.resume()
  }, [])

  const playTick = useCallback((): void => {
    const context = contextRef.current
    if (!context || mutedRef.current || context.state !== "running") return

    const startedAt = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(TICK_FREQUENCY_HZ, startedAt)
    gain.gain.setValueAtTime(TICK_PEAK_GAIN, startedAt)
    gain.gain.exponentialRampToValueAtTime(TICK_FADE_GAIN, startedAt + TICK_FADE_SECONDS)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(startedAt)
    oscillator.stop(startedAt + TICK_STOP_SECONDS)
  }, [])

  useEffect(
    () => () => {
      void contextRef.current?.close()
      contextRef.current = null
    },
    [],
  )

  return { muted, toggleMuted, unlockAudio, playTick }
}
