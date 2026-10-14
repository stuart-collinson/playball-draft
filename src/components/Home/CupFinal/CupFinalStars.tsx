import type { JSX } from "react"

type Props = {
  className?: string
}

const STAR_COUNT = 8

const RING_RADIUS = 43

const FULL_TURN = 360

const STAR_PATH =
  "M0 -5 L1.18 -1.62 L4.76 -1.55 L1.9 0.62 L2.94 4.05 L0 2 L-2.94 4.05 L-1.9 0.62 L-4.76 -1.55 L-1.18 -1.62 Z"

const STAR_ANGLES = Array.from(
  { length: STAR_COUNT },
  (_, index) => (index * FULL_TURN) / STAR_COUNT,
)

export const CupFinalStars = ({ className }: Props): JSX.Element => (
  <svg viewBox="-50 -50 100 100" aria-hidden="true" className={className}>
    {STAR_ANGLES.map((angle) => (
      <path
        key={angle}
        d={STAR_PATH}
        transform={`rotate(${angle}) translate(0 -${RING_RADIUS})`}
        className="fill-cupfinal-shine drop-shadow-[0_0_3px_var(--color-cupfinal-electric)]"
      />
    ))}
  </svg>
)
