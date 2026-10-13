import type { JSX } from "react"

type Props = {
  className?: string
}

export const NewYearPartyHat = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 40 50" aria-hidden="true" className={className}>
    <path d="M20 4 L36 46 L4 46 Z" className="fill-newyear-magenta" />
    <path
      d="M15.4 16 L24.6 16 L26.1 20 L13.9 20 Z M10.9 28 L29.1 28 L30.7 32 L9.3 32 Z M6.3 40 L33.7 40 L35.2 44 L4.8 44 Z"
      className="fill-newyear-gold"
    />
    <rect x="3" y="45" width="34" height="3" rx="1.5" className="fill-newyear-gold" />
    <circle cx="20" cy="4.5" r="4" className="fill-newyear-cyan" />
  </svg>
)
