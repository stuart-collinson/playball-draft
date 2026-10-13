import type { JSX } from "react"

type Tone = "pink" | "lilac" | "butter"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  pink: "fill-easter-pink",
  lilac: "fill-easter-lilac",
  butter: "fill-easter-sun",
}

export const EasterTulip = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="0 0 12 26" aria-hidden="true" className={className}>
    <path d="M6 11 L6 26" strokeWidth="1.4" className="stroke-easter-grass-deep" />
    <path d="M6 21 C2 19 1 15 2 12 C5 14 6 18 6 21 Z" className="fill-easter-grass-deep" />
    <path
      d="M1.5 3 L4 6 L6 1 L8 6 L10.5 3 L10.5 8 C10.5 11 8.5 12.5 6 12.5 C3.5 12.5 1.5 11 1.5 8 Z"
      className={TONE_CLASSES[tone]}
    />
  </svg>
)
