import type { JSX } from "react"

type Props = {
  className?: string
}

export const EasterCloud = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 80 36" aria-hidden="true" className={className}>
    <path
      d="M16 34 C6 34 2 26 8 21 C6 13 16 8 24 13 C27 4 42 2 47 11 C54 6 66 9 66 18 C74 18 78 24 75 29 C73 33 69 34 66 34 Z"
      className="fill-easter-shell"
    />
  </svg>
)
