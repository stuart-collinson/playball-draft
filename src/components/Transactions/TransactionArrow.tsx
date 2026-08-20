import type { JSX } from "react"

const STROKE_WIDTH = 2

export const TransactionArrow = (): JSX.Element => (
  <svg
    viewBox="0 0 40 12"
    className="h-3 w-10"
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 2.5 L4 6 L8 9.5" className="stroke-red-400" />
    <path d="M4 6 H20" className="stroke-red-400" />
    <path d="M20 6 H36" className="stroke-green-400" />
    <path d="M32 2.5 L36 6 L32 9.5" className="stroke-green-400" />
  </svg>
)
