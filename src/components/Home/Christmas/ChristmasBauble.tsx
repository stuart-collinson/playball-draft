import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Tone = "berry" | "pine"

type Props = {
  tone: Tone
  className?: string
}

const BALL_CLASSES: Record<Tone, string> = {
  berry: "fill-christmas-berry",
  pine: "fill-christmas-pine",
}

const HIGHLIGHT_OPACITY = 0.35

export const ChristmasBauble = ({ tone, className }: Props): JSX.Element => (
  <svg
    viewBox="0 0 40 46"
    aria-hidden="true"
    className={cn("drop-shadow-[0_0_6px_var(--color-christmas-gold)]", className)}
  >
    <circle cx="20" cy="3" r="2.4" strokeWidth="1.2" className="fill-none stroke-christmas-gold" />
    <rect x="15" y="5" width="10" height="6" rx="1.5" className="fill-christmas-gold" />
    <circle cx="20" cy="28" r="17" className={BALL_CLASSES[tone]} />
    <path
      d="M4.5 25 L9 29 L13.5 25 L18 29 L22.5 25 L27 29 L31.5 25 L35.5 28.5"
      strokeWidth="2"
      strokeLinejoin="round"
      className="fill-none stroke-christmas-gold"
    />
    <circle cx="11" cy="35" r="1.6" className="fill-christmas-gold" />
    <circle cx="20" cy="38" r="1.6" className="fill-christmas-gold" />
    <circle cx="29" cy="35" r="1.6" className="fill-christmas-gold" />
    <ellipse
      cx="13"
      cy="19"
      rx="3.5"
      ry="5.5"
      fillOpacity={HIGHLIGHT_OPACITY}
      transform="rotate(30 13 19)"
      className="fill-christmas-snow"
    />
  </svg>
)
