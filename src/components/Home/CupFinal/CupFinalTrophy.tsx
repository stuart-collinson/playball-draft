import type { JSX } from "react"
import { useId } from "react"

type Props = {
  className?: string
}

const CHROME_STOPS = [
  { offset: "0%", tone: "var(--color-cupfinal-steel)" },
  { offset: "28%", tone: "var(--color-cupfinal-silver)" },
  { offset: "46%", tone: "var(--color-cupfinal-shine)" },
  { offset: "64%", tone: "var(--color-cupfinal-silver)" },
  { offset: "100%", tone: "var(--color-cupfinal-steel)" },
]

const EARS = [
  "M33 22 C9 11 1 47 24 57 C31 60 37 63 42 69",
  "M67 22 C91 11 99 47 76 57 C69 60 63 63 58 69",
]

export const CupFinalTrophy = ({ className }: Props): JSX.Element => {
  const chrome = useId()
  const chromeFill = `url(#${chrome})`

  return (
    <svg viewBox="0 0 100 124" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={chrome} x1="0" x2="1" y1="0" y2="0">
          {CHROME_STOPS.map(({ offset, tone }) => (
            <stop key={offset} offset={offset} style={{ stopColor: tone }} />
          ))}
        </linearGradient>
      </defs>
      {EARS.map((ear) => (
        <path
          key={ear}
          d={ear}
          fill="none"
          stroke={chromeFill}
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M27 14 C27 42 35 62 46 70 L46 84 C46 88 42 90 37 92 L63 92 C58 90 54 88 54 84 L54 70 C65 62 73 42 73 14 Z"
        fill={chromeFill}
      />
      <path
        d="M34 22 C34 40 38 55 44.5 63"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-cupfinal-shine opacity-80"
      />
      <ellipse cx="50" cy="14" rx="23" ry="5.5" fill={chromeFill} />
      <ellipse cx="50" cy="14" rx="18.5" ry="3.2" className="fill-cupfinal-navy" />
      <path d="M34 92 H66 L69.5 104 H30.5 Z" fill={chromeFill} />
      <rect x="25" y="104" width="50" height="16" rx="2.5" className="fill-cupfinal-navy" />
      <rect x="25" y="110" width="50" height="3" fill={chromeFill} />
    </svg>
  )
}
