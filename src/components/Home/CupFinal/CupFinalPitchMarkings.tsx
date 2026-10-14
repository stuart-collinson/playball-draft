import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

const LINE = "border-cupfinal-shine/30"

const BOXES = [
  "left-2 h-[58%] w-[13%] border-y border-r",
  "left-2 h-[30%] w-[5%] border-y border-r",
  "right-2 h-[58%] w-[13%] border-y border-l",
  "right-2 h-[30%] w-[5%] border-y border-l",
]

export const CupFinalPitchMarkings = (): JSX.Element => (
  <div aria-hidden className="pointer-events-none absolute inset-0">
    <div className={cn("absolute inset-2 rounded-sm border", LINE)} />
    <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-cupfinal-shine/30" />
    <div
      className={cn(
        "absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border",
        LINE,
      )}
    />
    <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cupfinal-shine/50" />
    {BOXES.map((box) => (
      <div key={box} className={cn("absolute top-1/2 -translate-y-1/2", LINE, box)} />
    ))}
  </div>
)
