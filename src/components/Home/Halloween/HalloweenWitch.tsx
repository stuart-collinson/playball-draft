import type { JSX } from "react"

type Props = {
  className?: string
}

export const HalloweenWitch = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 120 60" aria-hidden="true" className={className}>
    <g className="fill-halloween-night">
      <path d="M34 45 L116 34.5 L116.5 37 L34.5 48 Z" />
      <path d="M36 44 L6 34 L12 41 L2 44 L11 47 L4 54 L14 52 L10 60 L37 49 Z" />
      <path d="M33 43 L39 42 L40 50 L34 51 Z" />
      <path d="M66 22 C56 22 46 26 38 24 C44 30 52 34 58 38 Z" />
      <path d="M56 44 C58 34 62 26 66 21 L77 21 C80 28 82 34 84 40 Z" />
      <circle cx="72" cy="16" r="5.5" />
      <path d="M76 14 L85 18 L76 19.5 Z" />
      <path d="M67 18 C62 22 58 22 54 20 C58 24 63 25 68 22 Z" />
      <path d="M60 12 L86 8 L86.5 10.5 L61 14.5 Z" />
      <path d="M66 12 C66 6 62 2 54 0 C62 0 72 4 79 10 Z" />
      <path d="M74 26 C80 30 86 34 92 37 L91 40 C84 37 78 34 72 30 Z" />
      <circle cx="92" cy="38.5" r="2.2" />
      <path d="M74 40 C76 46 78 50 80 54 L88 54 C88 52 85 51 83 51 C81 48 80 44 79 40 Z" />
      <circle cx="46" cy="40" r="4" />
      <circle cx="49.5" cy="34.5" r="2.8" />
      <path d="M47.2 33 L47.4 29.5 L49.6 32 Z M50.2 32 L52.2 29.5 L52.3 33.2 Z" />
    </g>
    <path
      d="M42.5 41 C38 38.5 38 33 41.5 31"
      className="fill-none stroke-halloween-night"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)
