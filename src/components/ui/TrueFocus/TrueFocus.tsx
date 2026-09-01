"use client"

import { motion } from "motion/react"
import type { CSSProperties, JSX } from "react"
import { useEffect, useRef, useState } from "react"
import "./TrueFocus.css"

type TrueFocusProps = {
  sentence?: string
  blurAmount?: number
  borderColor?: string
  animationDuration?: number
  pauseBetweenAnimations?: number
}

type FocusRect = { x: number; y: number; width: number; height: number }

export const TrueFocus = ({
  sentence = "True Focus",
  blurAmount = 5,
  borderColor = "green",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
}: TrueFocusProps): JSX.Element => {
  const words = sentence.split(" ")
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [focusRect, setFocusRect] = useState<FocusRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const interval = setInterval(
      () => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
      },
      (animationDuration + pauseBetweenAnimations) * 1000,
    )

    return () => clearInterval(interval)
  }, [animationDuration, pauseBetweenAnimations, words.length])

  useEffect(() => {
    const wordEl = wordRefs.current[currentIndex]
    if (!wordEl || !containerRef.current) return

    const parentRect = containerRef.current.getBoundingClientRect()
    const activeRect = wordEl.getBoundingClientRect()

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    })
  }, [currentIndex, words.length])

  return (
    <div className="focus-container" ref={containerRef}>
      {words.map((word, index) => (
        <span
          key={index}
          ref={(el) => {
            wordRefs.current[index] = el
          }}
          className="focus-word"
          style={
            {
              filter: index === currentIndex ? "blur(0px)" : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
            } as CSSProperties
          }
        >
          {word}
        </span>
      ))}

      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
        }}
        transition={{ duration: animationDuration }}
        style={{ "--border-color": borderColor } as CSSProperties}
      >
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </motion.div>
    </div>
  )
}
