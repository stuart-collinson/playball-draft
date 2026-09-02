"use client"

import { HomeScreenFitContext } from "@pbd/components/Home/HomeScreenFitContext"
import {
  HOME_LINEUP_MIN_BOX_HEIGHT,
  HOME_SCREEN_BOX_CLASSES,
  HOME_SCREEN_NATURAL_HEIGHT,
} from "@pbd/lib/constants/Home"
import type { CSSProperties, JSX, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

type Props = {
  maxWidth: number
  children: ReactNode
}

type Box = { width: number; height: number }

const fitStyle = ({ width, height }: Box, maxWidth: number): CSSProperties => {
  const scale = Math.min(1, height / HOME_SCREEN_NATURAL_HEIGHT)

  return {
    width: Math.min(width / scale, maxWidth),
    height: height / scale,
    transform: `scale(${scale})`,
    transformOrigin: "top center",
  }
}

export const HomeScreenFit = ({ maxWidth, children }: Props): JSX.Element => {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Box | null>(null)

  useEffect(() => {
    const element = box.current
    if (!element) return

    const observer = new ResizeObserver(() =>
      setSize({ width: element.clientWidth, height: element.clientHeight }),
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const showLineups = size !== null && size.height >= HOME_LINEUP_MIN_BOX_HEIGHT

  return (
    <div ref={box} className={HOME_SCREEN_BOX_CLASSES}>
      <div className="h-full w-full shrink-0" style={size ? fitStyle(size, maxWidth) : undefined}>
        <HomeScreenFitContext value={{ showLineups }}>{children}</HomeScreenFitContext>
      </div>
    </div>
  )
}
