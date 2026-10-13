import type { JSX } from "react"

type Props = {
  className?: string
}

export const HalloweenBat = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 64 26" aria-hidden="true" className={className}>
    <path
      d="M32 7 L29.5 2 L28 8 C24 6 16 3 2 9 C7 10 9 14 9 18 C13 15 17 16 19 20 C22 17 25 17 27 20 C29 19 31 21 32 24 C33 21 35 19 37 20 C39 17 42 17 45 20 C47 16 51 15 55 18 C55 14 57 10 62 9 C48 3 40 6 36 8 L34.5 2 Z"
      className="fill-halloween-night"
    />
  </svg>
)
