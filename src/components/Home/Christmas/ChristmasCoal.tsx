import type { JSX } from "react"

type Props = {
  className?: string
}

const FACET_OPACITY = 0.18

export const ChristmasCoal = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 44 22" aria-hidden="true" className={className}>
    <path
      d="M2 21 L5 12 L11 9 L17 12 L19 21 Z M14 21 L16 13 L23 8 L30 11 L32 21 Z M27 21 L30 15 L36 13 L42 17 L42 21 Z"
      className="fill-christmas-coal"
    />
    <path
      d="M11 9 L13 15 L17 12 Z M23 8 L25 14 L30 11 Z M36 13 L37 17 L42 17 Z"
      fillOpacity={FACET_OPACITY}
      className="fill-christmas-snow"
    />
  </svg>
)
