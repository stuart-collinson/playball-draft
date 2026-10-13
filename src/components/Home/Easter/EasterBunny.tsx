import type { JSX } from "react"

type Props = {
  className?: string
}

const BLUSH_OPACITY = 0.6

export const EasterBunny = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 50 64" aria-hidden="true" className={className}>
    <g strokeWidth="1.2" className="fill-easter-shell stroke-easter-ink/50">
      <ellipse cx="17" cy="17" rx="6" ry="16" transform="rotate(-14 17 17)" />
      <ellipse cx="33" cy="17" rx="6" ry="16" transform="rotate(14 33 17)" />
    </g>
    <ellipse
      cx="17"
      cy="18"
      rx="2.8"
      ry="11"
      transform="rotate(-14 17 18)"
      className="fill-easter-pink"
    />
    <ellipse
      cx="33"
      cy="18"
      rx="2.8"
      ry="11"
      transform="rotate(14 33 18)"
      className="fill-easter-pink"
    />
    <circle
      cx="25"
      cy="42"
      r="16"
      strokeWidth="1.2"
      className="fill-easter-shell stroke-easter-ink/50"
    />
    <circle cx="19" cy="39" r="2" className="fill-easter-ink" />
    <circle cx="31" cy="39" r="2" className="fill-easter-ink" />
    <circle cx="19.7" cy="38.3" r="0.6" className="fill-easter-shell" />
    <circle cx="31.7" cy="38.3" r="0.6" className="fill-easter-shell" />
    <path d="M23 45 L27 45 L25 47.5 Z" className="fill-easter-pink" />
    <path
      d="M25 47.5 Q23 50 21 49 M25 47.5 Q27 50 29 49 M14 45 L6 43 M14 47 L6 48 M36 45 L44 43 M36 47 L44 48"
      strokeWidth="0.9"
      strokeLinecap="round"
      className="fill-none stroke-easter-ink/60"
    />
    <circle cx="15" cy="46" r="3" fillOpacity={BLUSH_OPACITY} className="fill-easter-pink" />
    <circle cx="35" cy="46" r="3" fillOpacity={BLUSH_OPACITY} className="fill-easter-pink" />
    <g strokeWidth="1.2" className="fill-easter-shell stroke-easter-ink/50">
      <ellipse cx="16" cy="59" rx="5" ry="3.5" />
      <ellipse cx="34" cy="59" rx="5" ry="3.5" />
    </g>
  </svg>
)
