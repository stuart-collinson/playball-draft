import type { JSX } from "react"

type Props = {
  className?: string
}

export const EasterMeadow = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true" className={className}>
    <path
      d="M0 24 L0 11 C60 3 120 5 180 10 C240 15 280 6 340 5 C400 4 440 13 500 11 C540 10 570 6 600 8 L600 24 Z"
      className="fill-easter-grass"
    />
  </svg>
)
