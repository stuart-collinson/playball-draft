import type { JSX } from "react"

type Tone = "gold" | "silver"

type Props = {
  tone: Tone
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  gold: "fill-newyear-gold drop-shadow-[0_0_5px_var(--color-newyear-gold)]",
  silver: "fill-newyear-silver drop-shadow-[0_0_5px_var(--color-newyear-silver)]",
}

export const NewYearStar = ({ tone, className }: Props): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.5 21.5 L12 17.5 L5.5 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z"
      className={TONE_CLASSES[tone]}
    />
  </svg>
)
