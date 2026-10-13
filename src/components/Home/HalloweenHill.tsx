import type { JSX } from "react"

type Props = {
  className?: string
}

export const HalloweenHill = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true" className={className}>
    <path
      d="M0 24 L0 12 C40 4 80 4 120 10 C160 16 200 6 250 5 C300 4 330 14 380 12 C430 10 470 2 520 6 C560 9 580 12 600 10 L600 24 Z"
      className="fill-halloween-night"
    />
  </svg>
)
