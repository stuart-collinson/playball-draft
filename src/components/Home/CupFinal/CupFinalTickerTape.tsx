import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

const PIECE_COUNT = 44

const GOLDEN_RATIO_FRACTION = 0.618034

const HEIGHT_SCATTER = 0.381966

const HEIGHT_OFFSET = 0.13

const TILT_STEP_DEGREES = 47

const TILT_RANGE_DEGREES = 90

const FASTEST_FALL_SECONDS = 7

const FALL_SPEED_VARIANTS = 5

const DELAY_STEP_SECONDS = 0.73

const TONES = [
  "bg-cupfinal-silver",
  "bg-cupfinal-electric",
  "bg-cupfinal-shine",
  "bg-cupfinal-steel",
]

const SHAPES = ["h-3 w-1", "h-1 w-3", "h-2.5 w-1", "h-3.5 w-1.5"]

const PIECES = Array.from({ length: PIECE_COUNT }, (_, index) => ({
  left: ((index * GOLDEN_RATIO_FRACTION) % 1) * 100,
  top: ((index * HEIGHT_SCATTER + HEIGHT_OFFSET) % 1) * 100,
  tilt: ((index * TILT_STEP_DEGREES) % TILT_RANGE_DEGREES) - TILT_RANGE_DEGREES / 2,
  tone: TONES[index % TONES.length],
  shape: SHAPES[index % SHAPES.length],
  duration: FASTEST_FALL_SECONDS + (index % FALL_SPEED_VARIANTS),
  delay: -index * DELAY_STEP_SECONDS,
}))

export const CupFinalTickerTape = (): JSX.Element => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 -top-2 bottom-0 overflow-hidden"
  >
    {PIECES.map(({ left, top, tilt, tone, shape, duration, delay }) => (
      <span
        key={left}
        className="absolute top-0 h-full w-3 motion-safe:animate-cupfinal-ticker"
        style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      >
        <span
          className={cn("absolute block rounded-[1px] motion-safe:animate-swing", tone, shape)}
          style={{ top: `${top}%`, rotate: `${tilt}deg`, animationDelay: `${delay}s` }}
        />
      </span>
    ))}
  </div>
)
