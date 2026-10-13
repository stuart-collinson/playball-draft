import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Props = {
  className?: string
}

export const HalloweenPumpkin = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 64 58" aria-hidden="true" className={cn("halloween-lamp-glow", className)}>
    <path
      d="M30 15 C30 9 32 4 37 1 L39.5 4 C35.5 6.5 34.5 10 34.5 15 Z"
      className="fill-halloween-moss"
    />
    <ellipse cx="20" cy="36" rx="16" ry="20" className="fill-halloween-ember" />
    <ellipse cx="44" cy="36" rx="16" ry="20" className="fill-halloween-ember" />
    <ellipse cx="32" cy="36" rx="15" ry="21" className="fill-halloween-pumpkin" />
    <g className="fill-halloween-candle motion-safe:animate-halloween-flicker">
      <path d="M18 31 L25 23 L28 33 Z" />
      <path d="M46 31 L39 23 L36 33 Z" />
      <path d="M32 34 L29 39 L35 39 Z" />
      <path d="M16 41 Q32 57 48 41 L44 44 L40 41.5 L36 45 L32 42 L28 45 L24 41.5 L20 44 Z" />
    </g>
  </svg>
)
