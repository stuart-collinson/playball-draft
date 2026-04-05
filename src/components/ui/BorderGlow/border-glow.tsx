"use client"

import { useRef, useCallback, useEffect } from "react"
import type { JSX, ReactNode, CSSProperties } from "react"
import "./border-glow.css"

type BorderGlowProps = {
  children?: ReactNode
  className?: string
  edgeSensitivity?: number
  glowColor?: string
  backgroundColor?: string
  borderRadius?: number
  glowRadius?: number
  glowIntensity?: number
  coneSpread?: number
  animated?: boolean
  colors?: string[]
  fillOpacity?: number
}

const parseHSL = (hslStr: string): { h: number; s: number; l: number } => {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 40, s: 80, l: 80 }
  return {
    h: Number.parseFloat(match[1] ?? "40"),
    s: Number.parseFloat(match[2] ?? "80"),
    l: Number.parseFloat(match[3] ?? "80"),
  }
}

const buildGlowVars = (glowColor: string, intensity: number): Record<string, string> => {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"]
  const vars: Record<string, string> = {}
  for (let i = 0; i < opacities.length; i++) {
    const opacity = Math.min((opacities[i] ?? 100) * intensity, 100)
    vars[`--glow-color${keys[i] ?? ""}`] = `hsl(${base} / ${opacity}%)`
  }
  return vars
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
]
const GRADIENT_KEYS = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
]
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

const buildGradientVars = (colors: string[]): Record<string, string> => {
  const vars: Record<string, string> = {}
  for (let i = 0; i < 7; i++) {
    const colorIdx = Math.min(COLOR_MAP[i] ?? 0, colors.length - 1)
    const c = colors[colorIdx] ?? colors[0] ?? "#c084fc"
    const key = GRADIENT_KEYS[i] ?? "--gradient-one"
    const pos = GRADIENT_POSITIONS[i] ?? "50% 50%"
    vars[key] = `radial-gradient(at ${pos}, ${c} 0px, transparent 50%)`
  }
  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`
  return vars
}

const easeOutCubic = (x: number): number => 1 - (1 - x) ** 3
const easeInCubic = (x: number): number => x * x * x

type AnimateOpts = {
  start?: number
  end?: number
  duration?: number
  delay?: number
  ease?: (t: number) => number
  onUpdate: (v: number) => void
  onEnd?: () => void
}

const animateValue = ({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateOpts): void => {
  const t0 = performance.now() + delay
  const tick = (): void => {
    const elapsed = performance.now() - t0
    const t = Math.min(elapsed / duration, 1)
    onUpdate(start + (end - start) * ease(t))
    if (t < 1) requestAnimationFrame(tick)
    else if (onEnd) onEnd()
  }
  setTimeout(() => requestAnimationFrame(tick), delay)
}

export const BorderGlow = ({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#060010",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.5,
}: BorderGlowProps): JSX.Element => {
  const cardRef = useRef<HTMLDivElement>(null)

  const getCenterOfElement = useCallback((el: HTMLElement): [number, number] => {
    const { width, height } = el.getBoundingClientRect()
    return [width / 2, height / 2]
  }, [])

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number): number => {
      const [cx, cy] = getCenterOfElement(el)
      const dx = x - cx
      const dy = y - cy
      let kx = Number.POSITIVE_INFINITY
      let ky = Number.POSITIVE_INFINITY
      if (dx !== 0) kx = cx / Math.abs(dx)
      if (dy !== 0) ky = cy / Math.abs(dy)
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
    },
    [getCenterOfElement],
  )

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number): number => {
      const [cx, cy] = getCenterOfElement(el)
      const dx = x - cx
      const dy = y - cy
      if (dx === 0 && dy === 0) return 0
      const radians = Math.atan2(dy, dx)
      let degrees = radians * (180 / Math.PI) + 90
      if (degrees < 0) degrees += 360
      return degrees
    },
    [getCenterOfElement],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const edge = getEdgeProximity(card, x, y)
      const angle = getCursorAngle(card, x, y)
      card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`)
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`)
    },
    [getEdgeProximity, getCursorAngle],
  )

  useEffect(() => {
    if (!animated || !cardRef.current) return
    const card = cardRef.current
    const angleStart = 110
    const angleEnd = 465
    card.classList.add("sweep-active")
    card.style.setProperty("--cursor-angle", `${angleStart}deg`)

    animateValue({
      duration: 500,
      onUpdate: (v) => card.style.setProperty("--edge-proximity", `${v}`),
    })
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (v) => {
        card.style.setProperty(
          "--cursor-angle",
          `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
        )
      },
    })
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (v) => {
        card.style.setProperty(
          "--cursor-angle",
          `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
        )
      },
    })
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (v) => card.style.setProperty("--edge-proximity", `${v}`),
      onEnd: () => card.classList.remove("sweep-active"),
    })
  }, [animated])

  const glowVars = buildGlowVars(glowColor, glowIntensity)

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={
        {
          "--card-bg": backgroundColor,
          "--edge-sensitivity": edgeSensitivity,
          "--border-radius": `${borderRadius}px`,
          "--glow-padding": `${glowRadius}px`,
          "--cone-spread": coneSpread,
          "--fill-opacity": fillOpacity,
          ...glowVars,
          ...buildGradientVars(colors),
        } as CSSProperties
      }
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}
