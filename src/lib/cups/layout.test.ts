import { cupDrawPairs } from "@pbd/lib/cups/layout"
import type { CupTie } from "@pbd/types/cups.types"
import { describe, expect, it } from "vitest"

const tie = (position: number, one: string, two: string): CupTie => ({
  id: `round_of_16-${position}`,
  round: "round_of_16",
  position,
  personOne: one,
  personTwo: two,
  feederOne: [],
  feederTwo: [],
  legs: [],
  aggregateOne: null,
  aggregateTwo: null,
  winner: null,
  status: "scheduled",
})

describe("cupDrawPairs", () => {
  it("returns the first round in position order, which is the shuffled order", () => {
    const ties = [tie(1, "c", "d"), tie(0, "a", "b"), tie(2, "e", "f")]

    expect(cupDrawPairs(ties)).toEqual([
      { one: "a", two: "b" },
      { one: "c", two: "d" },
      { one: "e", two: "f" },
    ])
  })

  it("ignores every later round", () => {
    const ties = [tie(0, "a", "b"), { ...tie(0, "x", "y"), round: "quarter_final" as const }]

    expect(cupDrawPairs(ties)).toHaveLength(1)
  })

  it("keeps a tie whose participants are not known yet", () => {
    const pending = { ...tie(0, "a", "b"), personOne: null, personTwo: null }

    expect(cupDrawPairs([pending])).toEqual([{ one: null, two: null }])
  })
})
