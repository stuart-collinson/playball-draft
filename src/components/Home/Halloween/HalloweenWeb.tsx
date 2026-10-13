import type { JSX } from "react"

type Props = {
  className?: string
}

const WEB_REACH = 58

const SPOKE_STEP_DEGREES = 22.5

const SPOKE_COUNT = 5

const RING_RADII = [14, 26, 38, 50]

const RING_SAG = 0.84

const SPOKE_ANGLES = Array.from({ length: SPOKE_COUNT }, (_, index) => index * SPOKE_STEP_DEGREES)

const point = (radius: number, degrees: number): string => {
  const radians = (degrees * Math.PI) / 180
  return `${(radius * Math.cos(radians)).toFixed(1)} ${(radius * Math.sin(radians)).toFixed(1)}`
}

const ringSegment = (radius: number, toAngle: number): string => {
  const fromAngle = toAngle - SPOKE_STEP_DEGREES
  const sagPoint = point(radius * RING_SAG, fromAngle + SPOKE_STEP_DEGREES / 2)
  return `M${point(radius, fromAngle)} Q${sagPoint} ${point(radius, toAngle)}`
}

const SPOKES = SPOKE_ANGLES.map((angle) => `M0 0 L${point(WEB_REACH, angle)}`)

const RINGS = RING_RADII.flatMap((radius) =>
  SPOKE_ANGLES.slice(1).map((angle) => ringSegment(radius, angle)),
)

const WEB_PATH = [...SPOKES, ...RINGS].join(" ")

export const HalloweenWeb = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 60 60" aria-hidden="true" className={className}>
    <path d={WEB_PATH} strokeWidth="0.7" className="fill-none stroke-halloween-bone/45" />
    <g className="motion-safe:animate-float">
      <path d="M28 27 L28 43" strokeWidth="0.5" className="stroke-halloween-bone/60" />
      <path
        d="M26.5 45 L22.5 42 M26.5 46 L21.5 46.5 M26.5 47 L22.5 50.5 M27 48 L24.5 52.5 M29.5 45 L33.5 42 M29.5 46 L34.5 46.5 M29.5 47 L33.5 50.5 M29 48 L31.5 52.5"
        strokeWidth="0.9"
        strokeLinecap="round"
        className="stroke-halloween-night"
      />
      <circle cx="28" cy="43.5" r="1.9" className="fill-halloween-night" />
      <circle cx="28" cy="47" r="3" className="fill-halloween-night" />
    </g>
  </svg>
)
