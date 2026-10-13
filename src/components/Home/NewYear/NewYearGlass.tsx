import type { JSX } from "react"

type Props = {
  className?: string
}

const BUBBLES = [
  { cx: 13, cy: 22, r: 1 },
  { cx: 17, cy: 17, r: 0.8 },
  { cx: 15, cy: 12.5, r: 1 },
]

const GLASS_OPACITY = 0.3

export const NewYearGlass = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 30 56" aria-hidden="true" className={className}>
    <path
      d="M7 2 L23 2 L21 24 C20 29 17 31 15 31 C13 31 10 29 9 24 Z"
      fillOpacity={GLASS_OPACITY}
      strokeWidth="1"
      className="fill-newyear-silver stroke-newyear-silver"
    />
    <path
      d="M7.6 9 L22.4 9 L21 24 C20 29 17 31 15 31 C13 31 10 29 9 24 Z"
      className="fill-newyear-gold"
    />
    {BUBBLES.map(({ cx, cy, r }) => (
      <circle key={cy} cx={cx} cy={cy} r={r} className="fill-newyear-fizz" />
    ))}
    <rect x="14.2" y="31" width="1.6" height="18" className="fill-newyear-silver" />
    <ellipse cx="15" cy="51" rx="8" ry="2.2" className="fill-newyear-silver" />
  </svg>
)
