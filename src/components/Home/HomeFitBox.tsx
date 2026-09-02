"use client"

import type { JSX, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

const MIN_VISIBLE_SCALE = 0.12

type Props = {
  designWidth: number
  children: ReactNode
}

type Fit = {
  width: number
  height: number
  naturalHeight: number
}

export const HomeFitBox = ({ designWidth, children }: Props): JSX.Element => {
  const box = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<Fit | null>(null)

  useEffect(() => {
    const boxElement = box.current
    const contentElement = content.current
    if (!boxElement || !contentElement) return

    const observer = new ResizeObserver(() => {
      const next = {
        width: boxElement.clientWidth,
        height: boxElement.clientHeight,
        naturalHeight: contentElement.offsetHeight,
      }

      setFit((current) =>
        current &&
        current.width === next.width &&
        current.height === next.height &&
        current.naturalHeight === next.naturalHeight
          ? current
          : next,
      )
    })

    observer.observe(boxElement)
    observer.observe(contentElement)

    return () => observer.disconnect()
  }, [])

  const scale =
    fit && fit.naturalHeight > 0
      ? Math.min(fit.width / designWidth, fit.height / fit.naturalHeight)
      : 0

  return (
    <div ref={box} className="relative min-h-0 w-full flex-1 overflow-hidden">
      <div
        ref={content}
        className="absolute left-1/2 top-1/2"
        style={{
          width: designWidth,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: scale >= MIN_VISIBLE_SCALE ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  )
}
