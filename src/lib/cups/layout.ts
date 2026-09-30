import type { CupTie } from "@pbd/types/cups.types"

export type CupDrawPair = {
  one: string | null
  two: string | null
}

export const cupDrawPairs = (ties: readonly CupTie[]): CupDrawPair[] =>
  ties
    .filter((tie) => tie.round === "round_of_16")
    .sort((first, second) => first.position - second.position)
    .map((tie) => ({ one: tie.personOne, two: tie.personTwo }))
