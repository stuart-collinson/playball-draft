import type { JSX } from "react"

type Props = {
  className?: string
}

const SMILE_DOTS = [
  { cx: 20, cy: 28.5 },
  { cx: 22, cy: 30 },
  { cx: 24.5, cy: 30.5 },
  { cx: 27, cy: 30 },
]

export const ChristmasSnowman = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 48 64" aria-hidden="true" className={className}>
    <path
      d="M11 44 L2 36 M5 39 L2 40.5 M37 44 L46 36 M43 39 L46 40.5"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="fill-none stroke-christmas-pudding"
    />
    <g strokeWidth="0.8" className="fill-christmas-snow stroke-christmas-frost">
      <circle cx="24" cy="48" r="14" />
      <circle cx="24" cy="24" r="9.5" />
    </g>
    <rect x="12" y="13" width="24" height="3" rx="1" className="fill-christmas-night" />
    <rect x="16" y="2" width="16" height="12" rx="1.5" className="fill-christmas-night" />
    <rect x="16" y="10" width="16" height="2.5" className="fill-christmas-berry" />
    <circle cx="20.5" cy="22" r="1.2" className="fill-christmas-coal" />
    <circle cx="27.5" cy="22" r="1.2" className="fill-christmas-coal" />
    <path d="M24 24.5 L32 26.5 L24 27.5 Z" className="fill-christmas-carrot" />
    {SMILE_DOTS.map(({ cx, cy }) => (
      <circle key={cx} cx={cx} cy={cy} r="0.8" className="fill-christmas-coal" />
    ))}
    <path
      d="M14 32 C20 35 28 35 34 32 L34 35.5 C28 38.5 20 38.5 14 35.5 Z M30 35 L33 44 L29 44 L27 36 Z"
      className="fill-christmas-berry"
    />
    <circle cx="24" cy="44" r="1.3" className="fill-christmas-coal" />
    <circle cx="24" cy="50" r="1.3" className="fill-christmas-coal" />
  </svg>
)
