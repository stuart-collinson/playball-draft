import {
  countAddedElements,
  countDroppedElements,
  countWantedElements,
} from "@pbd/lib/fpl/marketCounts"
import type { Transaction } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const transaction = (overrides: Partial<Transaction>): Transaction => ({
  added: "",
  element_in: 0,
  element_out: 0,
  entry: 0,
  event: 1,
  id: 0,
  index: null,
  kind: "w",
  priority: null,
  result: "a",
  note: null,
  ...overrides,
})

describe("countAddedElements", () => {
  it("counts accepted additions only, most added first", () => {
    const counts = countAddedElements(
      [
        transaction({ element_in: 5, result: "a" }),
        transaction({ element_in: 5, result: "a" }),
        transaction({ element_in: 6, result: "a" }),
        transaction({ element_in: 7, result: "di" }),
      ],
      10,
    )

    expect(counts).toEqual([
      { elementId: 5, count: 2 },
      { elementId: 6, count: 1 },
    ])
  })
})

describe("countDroppedElements", () => {
  it("counts accepted drops and respects the limit", () => {
    const counts = countDroppedElements(
      [
        transaction({ element_out: 1, result: "a" }),
        transaction({ element_out: 2, result: "a" }),
        transaction({ element_out: 2, result: "a" }),
      ],
      1,
    )

    expect(counts).toEqual([{ elementId: 2, count: 2 }])
  })
})

describe("countWantedElements", () => {
  it("counts rejected waiver claims too", () => {
    const counts = countWantedElements(
      [
        transaction({ element_in: 9, kind: "w", result: "di" }),
        transaction({ element_in: 9, kind: "w", result: "a" }),
        transaction({ element_in: 4, kind: "f", result: "a" }),
      ],
      10,
    )

    expect(counts).toEqual([{ elementId: 9, count: 2 }])
  })

  it("breaks count ties by element id", () => {
    const counts = countWantedElements(
      [transaction({ element_in: 8, kind: "w" }), transaction({ element_in: 3, kind: "w" })],
      10,
    )

    expect(counts).toEqual([
      { elementId: 3, count: 1 },
      { elementId: 8, count: 1 },
    ])
  })
})
