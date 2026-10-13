import { cn } from "@pbd/lib/className"
import { easterTitleFont } from "@pbd/lib/fonts"
import type { JSX } from "react"

type Props = {
  className?: string
}

export const EasterBasket = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 64 56" aria-hidden="true" className={className}>
    <path
      d="M12 28 C12 4 52 4 52 28"
      strokeWidth="3.5"
      strokeLinecap="round"
      className="fill-none stroke-easter-wicker-deep"
    />
    <ellipse cx="22" cy="24" rx="6" ry="8" className="fill-easter-pink" />
    <ellipse cx="42" cy="24" rx="6" ry="8" className="fill-easter-butter" />
    <ellipse cx="32" cy="22" rx="6" ry="8.5" className="fill-easter-mint" />
    <path d="M5 26 L59 26 L53 52 L11 52 Z" className="fill-easter-wicker" />
    <path
      d="M7 33 L57 33 M8.5 40 L55.5 40 M10 47 L54 47"
      strokeWidth="1.5"
      className="fill-none stroke-easter-wicker-deep"
    />
    <rect x="3" y="24" width="58" height="5" rx="2.5" className="fill-easter-wicker-deep" />
    <rect x="21" y="34" width="22" height="13" rx="3" className="fill-easter-shell" />
    <text
      x="32"
      y="44.5"
      textAnchor="middle"
      className={cn(easterTitleFont.className, "fill-easter-ink text-[10px]")}
    >
      VS
    </text>
  </svg>
)
