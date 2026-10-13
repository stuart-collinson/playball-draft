import type { JSX } from "react"

type Tone = "pink" | "mint" | "butter" | "lilac"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  pink: "fill-easter-pink",
  mint: "fill-easter-mint",
  butter: "fill-easter-butter",
  lilac: "fill-easter-lilac",
}

export const EasterFlag = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="0 0 20 24" aria-hidden="true" className={className}>
    <path d="M0 0 L20 0 L10 22 Z" className={TONE_CLASSES[tone]} />
    <path
      d="M2.5 2 L17.5 2 L10 18.5 Z"
      strokeWidth="0.8"
      strokeDasharray="1.5 1.5"
      className="fill-none stroke-easter-shell"
    />
    <circle cx="10" cy="7" r="2.2" className="fill-easter-shell" />
  </svg>
)
