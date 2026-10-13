import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Props = {
  className?: string
}

const RIB_STROKE_WIDTH = 1.2

const GLOW_OPACITY = 0.75

export const HalloweenLantern = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 28 44" aria-hidden="true" className={cn("halloween-lamp-glow", className)}>
    <path d="M14 0 L14 5" className="stroke-halloween-bone/40" strokeWidth="1.5" />
    <rect x="9" y="4" width="10" height="5" rx="1" className="fill-halloween-stone" />
    <ellipse cx="14" cy="21" rx="12" ry="12" className="fill-halloween-pumpkin" />
    <ellipse
      cx="14"
      cy="21"
      rx="6.5"
      ry="7"
      fillOpacity={GLOW_OPACITY}
      className="fill-halloween-candle motion-safe:animate-halloween-flicker"
    />
    <ellipse
      cx="14"
      cy="21"
      rx="7"
      ry="12"
      strokeWidth={RIB_STROKE_WIDTH}
      className="fill-none stroke-halloween-ember"
    />
    <ellipse
      cx="14"
      cy="21"
      rx="2"
      ry="12"
      strokeWidth={RIB_STROKE_WIDTH}
      className="fill-none stroke-halloween-ember"
    />
    <rect x="9" y="32" width="10" height="4" rx="1" className="fill-halloween-stone" />
    <path
      d="M14 36 L14 43"
      className="stroke-halloween-ember"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)
