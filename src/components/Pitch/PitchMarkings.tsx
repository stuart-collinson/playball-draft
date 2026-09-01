import type { JSX } from "react"

const LINE = "border-white/15"

export const PitchMarkings = (): JSX.Element => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
    <div className={`absolute inset-x-2 inset-y-1.5 rounded-sm border ${LINE}`} />
    <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/15" />
    <div
      className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border ${LINE}`}
    />
    <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25" />
    <div
      className={`absolute left-1/2 top-1.5 h-14 w-[56%] -translate-x-1/2 rounded-b-sm border-x border-b ${LINE}`}
    />
    <div
      className={`absolute left-1/2 top-1.5 h-6 w-[28%] -translate-x-1/2 rounded-b-sm border-x border-b ${LINE}`}
    />
    <div
      className={`absolute bottom-1.5 left-1/2 h-14 w-[56%] -translate-x-1/2 rounded-t-sm border-x border-t ${LINE}`}
    />
    <div
      className={`absolute bottom-1.5 left-1/2 h-6 w-[28%] -translate-x-1/2 rounded-t-sm border-x border-t ${LINE}`}
    />
  </div>
)
