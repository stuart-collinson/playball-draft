import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Tone = "gold" | "magenta" | "cyan"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  gold: "fill-newyear-gold stroke-newyear-gold drop-shadow-[0_0_6px_var(--color-newyear-gold)]",
  magenta:
    "fill-newyear-magenta stroke-newyear-magenta drop-shadow-[0_0_6px_var(--color-newyear-magenta)]",
  cyan: "fill-newyear-cyan stroke-newyear-cyan drop-shadow-[0_0_6px_var(--color-newyear-cyan)]",
}

const RAY_COUNT = 12

const RAY_INNER = 6

const RAY_OUTER = 22

const SPARK_RADIUS = 26

const point = (radius: number, degrees: number): { x: string; y: string } => {
  const radians = (degrees * Math.PI) / 180
  return {
    x: (radius * Math.cos(radians)).toFixed(1),
    y: (radius * Math.sin(radians)).toFixed(1),
  }
}

const RAYS = Array.from({ length: RAY_COUNT }, (_, index) => {
  const angle = (index * 360) / RAY_COUNT
  const inner = point(RAY_INNER, angle)
  const outer = point(RAY_OUTER, angle)
  const spark = point(SPARK_RADIUS, angle)
  return { angle, path: `M${inner.x} ${inner.y} L${outer.x} ${outer.y}`, spark }
})

export const NewYearFirework = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="-30 -30 60 60" aria-hidden="true" className={cn(TONE_CLASSES[tone], className)}>
    {RAYS.map(({ angle, path, spark }) => (
      <g key={angle}>
        <path d={path} strokeWidth="1.6" strokeLinecap="round" className="fill-none" />
        <circle cx={spark.x} cy={spark.y} r="1.6" className="stroke-none" />
      </g>
    ))}
    <circle r="2.5" className="stroke-none" />
  </svg>
)
