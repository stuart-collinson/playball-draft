import { WheelBulb } from "@pbd/components/SpinTheWheel/WheelBulb"
import { RIM_RADIUS, WHEEL_CENTRE, WHEEL_VIEWBOX } from "@pbd/lib/wheelGeometry"
import type { JSX } from "react"

const RIM_WIDTH = 28
const HUB_RADIUS = 58
const BULB_COUNT = 20

const BULB_ANGLES = Array.from({ length: BULB_COUNT }, (_, index) => (360 / BULB_COUNT) * index)

export const WheelRim = (): JSX.Element => (
  <svg
    viewBox={WHEEL_VIEWBOX}
    className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    aria-hidden="true"
  >
    <circle
      cx={WHEEL_CENTRE}
      cy={WHEEL_CENTRE}
      r={RIM_RADIUS}
      fill="none"
      className="stroke-wheel-rim"
      strokeWidth={RIM_WIDTH}
    />

    {BULB_ANGLES.map((angle, index) => (
      <WheelBulb key={angle} angle={angle} offsetBlink={index % 2 === 1} />
    ))}

    <circle cx={WHEEL_CENTRE} cy={WHEEL_CENTRE} r={HUB_RADIUS} className="fill-wheel-rim" />
  </svg>
)
