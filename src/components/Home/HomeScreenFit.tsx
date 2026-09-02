"use client"

import { HOME_SCREEN_BOX_CLASSES, HOME_SCREEN_NATURAL_HEIGHT } from "@pbd/lib/constants/Home"
import type { CSSProperties, JSX, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

type Props = {
  children: ReactNode
}

type Box = { width: number; height: number }

const fitStyle = ({ width, height }: Box): CSSProperties => {
  const scale = Math.min(1, height / HOME_SCREEN_NATURAL_HEIGHT)

  return {
    width: width / scale,
    height: height / scale,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  }
}

export const HomeScreenFit = ({ children }: Props): JSX.Element => {
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

  return (
    <div ref={box} className={HOME_SCREEN_BOX_CLASSES}>
      <div className="h-full w-full" style={size ? fitStyle(size) : undefined}>
        {children}
      </div>
    </div>
  )
}
