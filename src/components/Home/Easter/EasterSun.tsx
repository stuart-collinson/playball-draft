import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Props = {
  className?: string
}

const RAY_COUNT = 12

const RAY_ANGLES = Array.from({ length: RAY_COUNT }, (_, index) => (index * 360) / RAY_COUNT)

const CHEEK_OPACITY = 0.7

export const EasterSun = ({ className }: Props): JSX.Element => (
  <svg
    viewBox="-50 -50 100 100"
    aria-hidden="true"
    className={cn("drop-shadow-[0_0_14px_var(--color-easter-sun)]", className)}
  >
    <g className="origin-center [transform-box:fill-box] motion-safe:animate-easter-spin">
      {RAY_ANGLES.map((angle) => (
        <path
          key={angle}
          d="M-5 -31 L0 -47 L5 -31 Z"
          transform={`rotate(${angle})`}
          className="fill-easter-sun"
        />
      ))}
    </g>
    <circle r="28" className="fill-easter-sun" />
    <path
      d="M-13 -5 Q-8.5 -11 -4 -5 M4 -5 Q8.5 -11 13 -5 M-11 6 Q0 17 11 6"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="fill-none stroke-easter-ink"
    />
    <circle cx="-16" cy="5" r="4" fillOpacity={CHEEK_OPACITY} className="fill-easter-pink" />
    <circle cx="16" cy="5" r="4" fillOpacity={CHEEK_OPACITY} className="fill-easter-pink" />
  </svg>
)
