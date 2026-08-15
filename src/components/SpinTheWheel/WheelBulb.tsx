import { cn } from "@pbd/lib/utils/cn"
import { RIM_RADIUS, polar } from "@pbd/lib/wheelGeometry"
import type { JSX } from "react"

type WheelBulbProps = {
  angle: number
  offsetBlink: boolean
}

const BULB_CORE_SIZE = 3.5
const BULB_HALO_SIZE = 7.5
const BULB_HALO_OPACITY = 0.25

export const WheelBulb = ({ angle, offsetBlink }: WheelBulbProps): JSX.Element => {
  const position = polar(RIM_RADIUS, angle)

  return (
    <g className={cn("wheel-bulb", offsetBlink && "wheel-bulb-alt")}>
      <circle
        cx={position.x}
        cy={position.y}
        r={BULB_HALO_SIZE}
        className="fill-wheel-bulb"
        opacity={BULB_HALO_OPACITY}
      />
      <circle cx={position.x} cy={position.y} r={BULB_CORE_SIZE} className="fill-wheel-bulb" />
    </g>
  )
}
