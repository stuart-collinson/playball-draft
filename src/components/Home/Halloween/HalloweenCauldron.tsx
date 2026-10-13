import { cn } from "@pbd/lib/className"
import { halloweenTitleFont } from "@pbd/lib/fonts"
import type { JSX } from "react"

type Props = {
  className?: string
}

const BUBBLES = [
  { cx: 23, cy: 15, r: 3, delay: "0s" },
  { cx: 34, cy: 11, r: 2.2, delay: "0.8s" },
  { cx: 43, cy: 16, r: 2.6, delay: "1.6s" },
]

export const HalloweenCauldron = ({ className }: Props): JSX.Element => (
  <svg
    viewBox="0 0 64 60"
    aria-hidden="true"
    className={cn("drop-shadow-[0_0_8px_var(--color-halloween-slime)]", className)}
  >
    {BUBBLES.map(({ cx, cy, r, delay }) => (
      <circle
        key={cx}
        cx={cx}
        cy={cy}
        r={r}
        className="origin-center fill-halloween-slime [transform-box:fill-box] motion-safe:animate-halloween-bubble"
        style={{ animationDelay: delay }}
      />
    ))}
    <path d="M10 24 C8 44 18 54 32 54 C46 54 56 44 54 24 Z" className="fill-halloween-night" />
    <path d="M16 50 L12 58 L19 58 Z M48 50 L52 58 L45 58 Z" className="fill-halloween-night" />
    <rect x="5" y="19" width="54" height="7" rx="3.5" className="fill-halloween-stone" />
    <ellipse cx="32" cy="21.5" rx="22" ry="3" className="fill-halloween-slime" />
    <text
      x="32"
      y="44"
      textAnchor="middle"
      className={cn(halloweenTitleFont.className, "fill-halloween-slime text-[17px]")}
    >
      VS
    </text>
  </svg>
)
