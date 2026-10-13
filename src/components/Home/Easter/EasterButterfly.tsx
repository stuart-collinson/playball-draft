import type { JSX } from "react"

type Tone = "pink" | "lilac"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  pink: "fill-easter-pink",
  lilac: "fill-easter-lilac",
}

export const EasterButterfly = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="0 0 30 24" aria-hidden="true" className={className}>
    <g className="origin-center [transform-box:fill-box] motion-safe:animate-easter-flutter">
      <path
        d="M15 12 C11 3 3 1 2.5 8 C2 13 9 14 15 12 Z M15 12 C19 3 27 1 27.5 8 C28 13 21 14 15 12 Z M15 12 C10 14 6 19 8.5 21.5 C11 23.5 14 18 15 12 Z M15 12 C20 14 24 19 21.5 21.5 C19 23.5 16 18 15 12 Z"
        className={TONE_CLASSES[tone]}
      />
      <circle cx="7" cy="7.5" r="1.6" className="fill-easter-shell" />
      <circle cx="23" cy="7.5" r="1.6" className="fill-easter-shell" />
    </g>
    <rect x="14" y="7" width="2" height="12" rx="1" className="fill-easter-ink" />
    <path
      d="M15 8 C14 5 12 3 11 2 M15 8 C16 5 18 3 19 2"
      strokeWidth="0.8"
      strokeLinecap="round"
      className="fill-none stroke-easter-ink"
    />
  </svg>
)
