import type { JSX } from "react"

type Tone = "berry" | "gold" | "pine" | "frost"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  berry: "fill-christmas-berry drop-shadow-[0_0_6px_var(--color-christmas-berry)]",
  gold: "fill-christmas-gold drop-shadow-[0_0_6px_var(--color-christmas-gold)]",
  pine: "fill-christmas-pine drop-shadow-[0_0_6px_var(--color-christmas-pine)]",
  frost: "fill-christmas-frost drop-shadow-[0_0_6px_var(--color-christmas-frost)]",
}

const HIGHLIGHT_OPACITY = 0.55

export const ChristmasBulb = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="0 0 16 28" aria-hidden="true" className={className}>
    <rect x="5" y="0" width="6" height="6" rx="1" className="fill-christmas-pine-deep" />
    <path
      d="M8 6 C3 9 2 15 4 20 C5.5 24 10.5 24 12 20 C14 15 13 9 8 6 Z"
      className={TONE_CLASSES[tone]}
    />
    <ellipse
      cx="6"
      cy="13"
      rx="1.4"
      ry="3"
      fillOpacity={HIGHLIGHT_OPACITY}
      className="fill-christmas-snow"
    />
  </svg>
)
