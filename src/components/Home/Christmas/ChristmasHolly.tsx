import type { JSX } from "react"

type Props = {
  className?: string
}

const LEAF_PATH =
  "M32 18 C28 13 22 14 19 10 C18 13 15 14 12 13 C13 16 11 18 8 18 C10 21 10 24 8 26 C12 25 14 27 15 30 C18 27 23 26 32 20 Z"

const VEIN_PATH = "M31 19 C24 18 18 20 12 21"

const BERRIES = [
  { cx: 32, cy: 20, r: 3.6 },
  { cx: 27, cy: 23.5, r: 3.2 },
  { cx: 36.8, cy: 23.8, r: 3.2 },
]

export const ChristmasHolly = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 64 40" aria-hidden="true" className={className}>
    {["", "translate(64 0) scale(-1 1)"].map((transform) => (
      <g key={transform} transform={transform || undefined}>
        <path d={LEAF_PATH} className="fill-christmas-pine" />
        <path d={VEIN_PATH} strokeWidth="0.8" className="fill-none stroke-christmas-pine-deep" />
      </g>
    ))}
    {BERRIES.map(({ cx, cy, r }) => (
      <g key={cx}>
        <circle cx={cx} cy={cy} r={r} className="fill-christmas-berry" />
        <circle cx={cx - r / 3} cy={cy - r / 3} r={r / 4} className="fill-christmas-snow" />
      </g>
    ))}
  </svg>
)
