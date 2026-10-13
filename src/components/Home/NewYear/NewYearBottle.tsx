import type { JSX } from "react"

type Props = {
  className?: string
}

const SPRAY = [
  { cx: 17, cy: 6, r: 1.3 },
  { cx: 24, cy: 4.5, r: 1.1 },
  { cx: 14, cy: 2, r: 1 },
  { cx: 27.5, cy: 1.5, r: 1.2 },
  { cx: 21, cy: 1, r: 0.9 },
]

export const NewYearBottle = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 44 66" aria-hidden="true" className={className}>
    <g transform="rotate(-18 21 42)">
      <path
        d="M14 64 L14 36 C14 30 18 28 18 22 L18 14 L24 14 L24 22 C24 28 28 30 28 36 L28 64 Z"
        className="fill-newyear-bottle"
      />
      <path d="M18 14 L24 14 L24 24 L18 24 Z" className="fill-newyear-gold" />
      <rect x="15.5" y="42" width="11" height="10" rx="1" className="fill-newyear-fizz" />
      <rect x="17" y="45.5" width="8" height="1.4" className="fill-newyear-gold-deep" />
      <ellipse cx="21" cy="8.5" rx="3" ry="2.4" className="fill-newyear-gold-deep" />
      {SPRAY.map(({ cx, cy, r }) => (
        <circle key={cx} cx={cx} cy={cy} r={r} className="fill-newyear-fizz" />
      ))}
    </g>
  </svg>
)
