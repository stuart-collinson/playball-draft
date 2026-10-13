import type { JSX } from "react"

type Props = {
  className?: string
}

const REINDEER_BODY =
  "M2 20 C4 16 12 15 20 16 C24 16 27 14 29 10 L31 7 L33 9 L32 12 C33 14 35 15 36 17 L34 18 C32 17 31 17 30 19 C29 22 27 24 25 25 L32 30 L30 31.5 L22 26.5 C18 27.5 14 27.5 11 26.5 L3 32 L1 30.5 L7 24 C4 24 1 23 2 20 Z"

const REINDEER_ANTLERS =
  "M31 8 C30 4 27 3 25 4 M29.5 6 L27.5 4.5 M33 9 C34 5 37 4 39 5 M34.5 7 L36.5 5.5"

const REINDEER_POSITIONS = ["translate(62 10)", "translate(104 4)"]

export const ChristmasSleigh = ({ className }: Props): JSX.Element => (
  <svg viewBox="0 0 150 50" aria-hidden="true" className={className}>
    <g className="fill-christmas-night">
      <path d="M8 28 C6 18 8 10 14 8 C14 6 13 4 12 2 L16 3 C16 5 17 7 19 8 C24 10 25 20 22 28 Z" />
      <path d="M22 28 C22 19 26 15 32 15 C38 15 42 19 42 28 Z" />
      <circle cx="33" cy="11.5" r="4.5" />
      <path d="M29 8.5 C30 3 36 1 41 4 L43 7 L36 8 Z" />
      <circle cx="43" cy="6.5" r="1.6" />
      <path d="M2 14 C2 30 4 40 12 40 L46 40 C52 40 56 34 56 28 L20 28 C14 28 12 22 12 14 Z" />
      {REINDEER_POSITIONS.map((transform) => (
        <path key={transform} d={REINDEER_BODY} transform={transform} />
      ))}
    </g>
    <g strokeLinecap="round" className="fill-none stroke-christmas-night">
      <path d="M4 46 L50 46 C56 46 60 42 58 37 M14 40 L14 46 M44 40 L44 46" strokeWidth="2.5" />
      <path d="M38 21 L47 23" strokeWidth="2" />
      <path d="M47 23 L95 26 L137 20 M56 31 L68 31" strokeWidth="0.9" />
      {REINDEER_POSITIONS.map((transform) => (
        <path key={transform} d={REINDEER_ANTLERS} transform={transform} strokeWidth="1.2" />
      ))}
    </g>
    <circle
      cx="140.5"
      cy="21.5"
      r="1.8"
      className="fill-christmas-berry drop-shadow-[0_0_3px_var(--color-christmas-berry)]"
    />
  </svg>
)
