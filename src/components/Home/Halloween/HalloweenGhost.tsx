import type { JSX } from "react"

type Props = {
  className?: string
}

export const HalloweenGhost = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 48 60" aria-hidden="true" className={className}>
    <path
      d="M24 2 C11 2 4 12 4 26 L4 52 Q8 58 12 52 Q16 46 20 52 Q24 58 28 52 Q32 46 36 52 Q40 58 44 52 L44 26 C44 12 37 2 24 2 Z"
      className="fill-halloween-bone"
    />
    <ellipse cx="17" cy="24" rx="3.5" ry="5" className="fill-halloween-night" />
    <ellipse cx="31" cy="24" rx="3.5" ry="5" className="fill-halloween-night" />
    <ellipse cx="24" cy="37" rx="4" ry="5.5" className="fill-halloween-night" />
  </svg>
)
