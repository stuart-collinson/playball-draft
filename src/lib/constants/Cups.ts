import type { CupFormat, CupRound } from "@pbd/types/cups.types"

export const CUP_ROUNDS = [
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
] as const satisfies readonly CupRound[]

export const CUP_FORMATS = ["knockout", "two_legs"] as const satisfies readonly CupFormat[]

export const CUP_ROUND_LABELS: Record<CupRound, string> = {
  round_of_16: "Round of 16",
  quarter_final: "Quarter Finals",
  semi_final: "Semi Finals",
  final: "Final",
}

export const CUP_ROUND_SHORT_LABELS: Record<CupRound, string> = {
  round_of_16: "RO16",
  quarter_final: "QF",
  semi_final: "SF",
  final: "Final",
}

export const CUP_ROUND_TIE_COUNTS: Record<CupRound, number> = {
  round_of_16: 8,
  quarter_final: 4,
  semi_final: 2,
  final: 1,
}

export const CUP_FORMAT_LABELS: Record<CupFormat, string> = {
  knockout: "Knockout",
  two_legs: "Two Legs",
}

export const CUP_FORMAT_HINTS: Record<CupFormat, string> = {
  knockout: "One game week per round",
  two_legs: "Two game weeks until the final",
}

export const CUP_MINIMUM_GAMEWEEKS: Record<CupFormat, number> = {
  knockout: 4,
  two_legs: 7,
}

export const CUP_ENTRANT_COUNT = 16

export const CUP_TIE_COUNT = 15

export const CUP_NAME_MAX_LENGTH = 60

export const CUP_SEED_BYTES = 32

export const CUPS_ERROR_TITLE = "Cups Unavailable"

export const CUPS_ERROR_MESSAGE = "The cups didn't load. Give it another go."

export const CUP_NO_SCORE = "–"

export const CUP_LEG_TO_COME = "TBC"

export const CUP_BRACKET_WIDE_FRAME = "hidden flex-col gap-3 xl:-mx-28 xl:flex 2xl:-mx-56"

export const CUP_BRACKET_GRID =
  "grid grid-cols-[repeat(3,1fr)_1.55fr_repeat(3,1fr)] gap-x-6 2xl:gap-x-10"

export const CUP_BRACKET_COLUMNS: { key: string; round: CupRound }[] = [
  { key: "round_of_16-left", round: "round_of_16" },
  { key: "quarter_final-left", round: "quarter_final" },
  { key: "semi_final-left", round: "semi_final" },
  { key: "final", round: "final" },
  { key: "semi_final-right", round: "semi_final" },
  { key: "quarter_final-right", round: "quarter_final" },
  { key: "round_of_16-right", round: "round_of_16" },
]

export const CUP_BRACKET_PLACEMENT: Record<CupRound, string[]> = {
  round_of_16: [
    "col-start-1 row-start-1",
    "col-start-1 row-start-2",
    "col-start-1 row-start-3",
    "col-start-1 row-start-4",
    "col-start-7 row-start-1",
    "col-start-7 row-start-2",
    "col-start-7 row-start-3",
    "col-start-7 row-start-4",
  ],
  quarter_final: [
    "col-start-2 row-start-1 row-span-2",
    "col-start-2 row-start-3 row-span-2",
    "col-start-6 row-start-1 row-span-2",
    "col-start-6 row-start-3 row-span-2",
  ],
  semi_final: ["col-start-3 row-start-1 row-span-4", "col-start-5 row-start-1 row-span-4"],
  final: ["col-start-4 row-start-1 row-span-4"],
}
