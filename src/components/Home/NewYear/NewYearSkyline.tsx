import type { JSX } from "react"

type Props = {
  className?: string
}

const SKYLINE_HEIGHT = 36

const WINDOW_STEP = 6

const WINDOW_INSET = 3

const LIT_WINDOW_EVERY = 3

const WINDOW_OPACITY = 0.85

const BUILDINGS = [
  { x: 0, width: 40, height: 18 },
  { x: 38, width: 30, height: 26 },
  { x: 66, width: 46, height: 14 },
  { x: 110, width: 24, height: 30 },
  { x: 132, width: 52, height: 20 },
  { x: 182, width: 30, height: 34 },
  { x: 210, width: 44, height: 16 },
  { x: 252, width: 36, height: 24 },
  { x: 286, width: 60, height: 12 },
  { x: 344, width: 28, height: 28 },
  { x: 370, width: 48, height: 18 },
  { x: 416, width: 34, height: 32 },
  { x: 448, width: 56, height: 15 },
  { x: 502, width: 30, height: 26 },
  { x: 530, width: 44, height: 20 },
  { x: 572, width: 26, height: 33 },
  { x: 596, width: 50, height: 14 },
  { x: 644, width: 36, height: 24 },
  { x: 678, width: 30, height: 30 },
  { x: 706, width: 48, height: 17 },
  { x: 752, width: 48, height: 25 },
]

const WINDOWS = BUILDINGS.flatMap(({ x, width, height }, building) => {
  const top = SKYLINE_HEIGHT - height
  const columns = Math.floor((width - WINDOW_INSET) / WINDOW_STEP)
  const rows = Math.floor((height - WINDOW_INSET) / WINDOW_STEP)

  return Array.from({ length: columns * rows }, (_, cell) => ({
    x: x + WINDOW_INSET + (cell % columns) * WINDOW_STEP,
    y: top + WINDOW_INSET + Math.floor(cell / columns) * WINDOW_STEP,
    lit: (building * 7 + cell) % LIT_WINDOW_EVERY === 0,
  })).filter(({ lit }) => lit)
})

export const NewYearSkyline = ({ className }: Props): JSX.Element => (
  <svg
    viewBox={`0 0 800 ${SKYLINE_HEIGHT}`}
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    className={className}
  >
    {BUILDINGS.map(({ x, width, height }) => (
      <rect
        key={x}
        x={x}
        y={SKYLINE_HEIGHT - height}
        width={width}
        height={height}
        className="fill-newyear-ink"
      />
    ))}
    {WINDOWS.map(({ x, y }) => (
      <rect
        key={`${x}-${y}`}
        x={x}
        y={y}
        width="2"
        height="2.5"
        fillOpacity={WINDOW_OPACITY}
        className="fill-newyear-gold"
      />
    ))}
  </svg>
)
