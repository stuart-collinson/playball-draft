import type { JSX } from "react"

type Props = {
  className?: string
}

const ARM_COUNT = 6

const ARM_PATH = "M0 0 L0 -9 M0 -6 L-2.5 -8 M0 -6 L2.5 -8 M0 -3 L-2 -4.6 M0 -3 L2 -4.6"

const ARM_ANGLES = Array.from({ length: ARM_COUNT }, (_, index) => (index * 360) / ARM_COUNT)

export const ChristmasSnowflake = ({ className }: Props): JSX.Element => (
  <svg viewBox="-10 -10 20 20" aria-hidden="true" className={className}>
    {ARM_ANGLES.map((angle) => (
      <path
        key={angle}
        d={ARM_PATH}
        transform={`rotate(${angle})`}
        strokeWidth="1.2"
        strokeLinecap="round"
        className="fill-none stroke-christmas-snow"
      />
    ))}
  </svg>
)
