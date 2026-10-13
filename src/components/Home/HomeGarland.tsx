import { cn } from "@pbd/lib/className"
import type { JSX, ReactNode } from "react"

type Props = {
  stops: readonly number[]
  stringClassName: string
  renderItem: (index: number) => ReactNode
  className?: string
}

const STRING_EDGE_Y = 2

const STRING_CONTROL_Y = 30

const SWING_STAGGER_SECONDS = 0.5

const stringY = (progress: number): number =>
  STRING_EDGE_Y + 2 * progress * (1 - progress) * (STRING_CONTROL_Y - STRING_EDGE_Y)

export const HomeGarland = ({
  stops,
  stringClassName,
  renderItem,
  className,
}: Props): JSX.Element => (
  <div aria-hidden className={cn("pointer-events-none relative h-10", className)}>
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      <path
        d={`M0 ${STRING_EDGE_Y} Q50 ${STRING_CONTROL_Y} 100 ${STRING_EDGE_Y}`}
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        className={cn("fill-none", stringClassName)}
      />
    </svg>
    {stops.map((stop, index) => (
      <span
        key={stop}
        className="absolute origin-top -translate-x-1/2 motion-safe:animate-swing"
        style={{
          left: `${stop * 100}%`,
          top: stringY(stop),
          animationDelay: `${index * SWING_STAGGER_SECONDS}s`,
        }}
      >
        {renderItem(index)}
      </span>
    ))}
  </div>
)
