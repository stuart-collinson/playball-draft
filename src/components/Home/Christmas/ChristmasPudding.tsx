import { cn } from "@pbd/lib/className"
import { christmasTitleFont } from "@pbd/lib/fonts"
import type { JSX } from "react"

type Props = {
  className?: string
}

const RAISINS = [
  { cx: 16, cy: 36 },
  { cx: 24, cy: 40 },
  { cx: 39, cy: 37 },
  { cx: 46, cy: 40 },
]

export const ChristmasPudding = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 60 54" aria-hidden="true" className={className}>
    <ellipse cx="30" cy="48" rx="27" ry="5" className="fill-christmas-frost" />
    <path d="M8 45 C6 27 16 15 30 15 C44 15 54 27 52 45 Z" className="fill-christmas-pudding" />
    <path
      d="M11 27 C15 17 45 17 49 27 C47 29 45 26 43 30 C41 33 39 28 37 31 C35 34 32 29 30 32 C28 35 25 29 23 32 C21 34 19 28 17 31 C15 32 13 29 11 27 Z"
      className="fill-christmas-snow"
    />
    {RAISINS.map(({ cx, cy }) => (
      <circle key={cx} cx={cx} cy={cy} r="1.4" className="fill-christmas-coal" />
    ))}
    <path
      d="M30 15 C27 11 23 12 21 9 C24 9 26 8 27 6 C28 9 30 11 30 15 Z M30 15 C33 11 37 12 39 9 C36 9 34 8 33 6 C32 9 30 11 30 15 Z"
      className="fill-christmas-pine"
    />
    <circle cx="28.5" cy="13.5" r="2" className="fill-christmas-berry" />
    <circle cx="31.5" cy="13.5" r="2" className="fill-christmas-berry" />
    <text
      x="30"
      y="44"
      textAnchor="middle"
      className={cn(christmasTitleFont.className, "fill-christmas-gold text-[13px]")}
    >
      VS
    </text>
  </svg>
)
