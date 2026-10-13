import { cn } from "@pbd/lib/className"
import { newYearTitleFont } from "@pbd/lib/fonts"
import type { JSX } from "react"

type Props = {
  className?: string
}

const HOUR_MARK_COUNT = 12

const HOUR_MARKS = Array.from(
  { length: HOUR_MARK_COUNT },
  (_, index) => (index * 360) / HOUR_MARK_COUNT,
)

const QUARTER_HOUR_DEGREES = 90

const HOUR_HAND_DEGREES = -1

const MINUTE_HAND_DEGREES = -12

export const NewYearClock = ({ className }: Props): JSX.Element => (
  <svg
    viewBox="0 0 60 60"
    aria-hidden="true"
    className={cn("drop-shadow-[0_0_8px_var(--color-newyear-gold)]", className)}
  >
    <circle cx="30" cy="30" r="28" className="fill-newyear-gold-deep" />
    <circle cx="30" cy="30" r="24.5" className="fill-newyear-fizz" />
    {HOUR_MARKS.map((angle) => (
      <path
        key={angle}
        d={angle % QUARTER_HOUR_DEGREES === 0 ? "M30 7 L30 11.5" : "M30 7 L30 9.5"}
        transform={`rotate(${angle} 30 30)`}
        strokeWidth={angle % QUARTER_HOUR_DEGREES === 0 ? 2 : 1.2}
        strokeLinecap="round"
        className="stroke-newyear-ink"
      />
    ))}
    <path
      d="M30 30 L30 17"
      transform={`rotate(${HOUR_HAND_DEGREES} 30 30)`}
      strokeWidth="2.6"
      strokeLinecap="round"
      className="stroke-newyear-ink"
    />
    <path
      d="M30 30 L30 11"
      transform={`rotate(${MINUTE_HAND_DEGREES} 30 30)`}
      strokeWidth="1.6"
      strokeLinecap="round"
      className="stroke-newyear-ink"
    />
    <circle cx="30" cy="30" r="2" className="fill-newyear-gold-deep" />
    <text
      x="30"
      y="46"
      textAnchor="middle"
      className={cn(newYearTitleFont.className, "fill-newyear-ink text-[9px]")}
    >
      VS
    </text>
  </svg>
)
