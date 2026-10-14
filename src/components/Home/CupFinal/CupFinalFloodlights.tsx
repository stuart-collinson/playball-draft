import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

const FLOODLIGHTS = [
  {
    key: "left",
    tower: "left-1 -rotate-12",
    beam: "left-[-26%] -rotate-[30deg]",
    delay: "0s",
  },
  {
    key: "right",
    tower: "right-1 rotate-12",
    beam: "right-[-26%] rotate-[30deg]",
    delay: "-3.5s",
  },
]

const BULBS = ["a", "b", "c", "d", "e", "f", "g", "h"]

const FLASHES = [
  { position: "left-[3%] top-[22%]", delay: "0s" },
  { position: "left-[30%] top-[19%]", delay: "1.1s" },
  { position: "left-[33%] top-[29%]", delay: "2.3s" },
  { position: "left-[36%] top-[41%]", delay: "0.6s" },
  { position: "left-[5%] top-[44%]", delay: "1.8s" },
  { position: "right-[3%] top-[25%]", delay: "0.3s" },
  { position: "right-[30%] top-[20%]", delay: "2.6s" },
  { position: "right-[33%] top-[31%]", delay: "1.4s" },
  { position: "right-[36%] top-[43%]", delay: "0.9s" },
  { position: "right-[5%] top-[40%]", delay: "2s" },
]

export const CupFinalFloodlights = (): JSX.Element => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <span className="cupfinal-crowd absolute inset-x-0 top-[18%] h-[26%] opacity-70" />
    {FLOODLIGHTS.map(({ key, beam, delay }) => (
      <span key={`${key}-beam`} className={cn("absolute top-3 h-[80%] w-[64%] origin-top", beam)}>
        <span
          className="cupfinal-beam block h-full w-full origin-top motion-safe:animate-cupfinal-sweep"
          style={{ animationDelay: delay }}
        />
      </span>
    ))}
    {FLOODLIGHTS.map(({ key, tower }) => (
      <span
        key={`${key}-tower`}
        className={cn(
          "absolute top-1.5 grid grid-cols-4 gap-0.5 rounded-sm bg-cupfinal-navy p-1 ring-1 ring-cupfinal-steel/50",
          tower,
        )}
      >
        {BULBS.map((bulb) => (
          <span
            key={bulb}
            className="size-1.5 rounded-full bg-cupfinal-shine shadow-[0_0_6px_var(--color-cupfinal-shine)]"
          />
        ))}
      </span>
    ))}
    {FLASHES.map(({ position, delay }) => (
      <span
        key={position}
        className={cn(
          "absolute size-1 rounded-full bg-cupfinal-shine shadow-[0_0_8px_2px_var(--color-cupfinal-shine)] motion-safe:animate-twinkle",
          position,
        )}
        style={{ animationDelay: delay }}
      />
    ))}
  </div>
)
