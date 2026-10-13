import type { JSX } from "react"

type Props = {
  className?: string
}

export const EasterChick = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 40 42" aria-hidden="true" className={className}>
    <path d="M18 8 C16 3 20 1 20 6 C21 1 25 3 22 8 Z" className="fill-easter-sun" />
    <circle cx="20" cy="20" r="13" className="fill-easter-butter" />
    <path d="M8 22 C4 20 4 26 9 27 Z M32 22 C36 20 36 26 31 27 Z" className="fill-easter-sun" />
    <circle cx="16" cy="17" r="1.6" className="fill-easter-ink" />
    <circle cx="24" cy="17" r="1.6" className="fill-easter-ink" />
    <path d="M18 21 L22 21 L20 24.5 Z" className="fill-easter-beak" />
    <path
      d="M5 27 L9 23.5 L13 27 L17 23.5 L21 27 L25 23.5 L29 27 L33 23.5 L35 26 L35 31 C35 38 28 41 20 41 C12 41 5 38 5 31 Z"
      strokeWidth="0.8"
      className="fill-easter-shell stroke-easter-ink/30"
    />
  </svg>
)
