import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Tone = "pink" | "mint" | "lilac" | "butter"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  pink: "fill-easter-pink",
  mint: "fill-easter-mint",
  lilac: "fill-easter-lilac",
  butter: "fill-easter-butter",
}

const DOTS = [
  { cx: 14, cy: 12 },
  { cx: 20, cy: 9.5 },
  { cx: 26, cy: 12 },
  { cx: 11, cy: 41 },
  { cx: 20, cy: 43 },
  { cx: 29, cy: 41 },
]

const HIGHLIGHT_OPACITY = 0.4

export const EasterEgg = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="0 0 40 50" aria-hidden="true" className={className}>
    <path
      d="M20 2 C9 2 2 20 2 31 C2 42 10 48 20 48 C30 48 38 42 38 31 C38 20 31 2 20 2 Z"
      strokeWidth="1.2"
      className={cn(TONE_CLASSES[tone], "stroke-easter-ink/25")}
    />
    <path
      d="M4 24 L8 19.5 L12.5 24 L17 19.5 L21.5 24 L26 19.5 L30.5 24 L34.5 20 M3 33 Q8 29 13 33 Q18 37 23 33 Q28 29 33 33 Q35.5 35 37 33.5"
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className="fill-none stroke-easter-shell"
    />
    {DOTS.map(({ cx, cy }) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" className="fill-easter-shell" />
    ))}
    <ellipse
      cx="12"
      cy="16"
      rx="2.5"
      ry="5"
      transform="rotate(20 12 16)"
      fillOpacity={HIGHLIGHT_OPACITY}
      className="fill-easter-shell"
    />
  </svg>
)
