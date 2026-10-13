import type { JSX } from "react"

type Props = {
  className?: string
}

export const ChristmasDrift = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true" className={className}>
    <path
      d="M0 24 L0 10 C50 2 100 4 150 9 C200 14 240 5 300 4 C360 3 390 12 440 11 C490 10 530 3 600 8 L600 24 Z"
      className="fill-christmas-snow"
    />
  </svg>
)
