import { collectDrops, findReacquisitionEvent, sumPointsSince } from "@pbd/lib/fpl/gotAway"
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

describe("collectDrops", () => {
  it("collects only accepted waiver and free-agent drops", () => {
    const drops = collectDrops([
      transaction({ element_out: 7, entry: 1, event: 3, kind: "w", result: "a" }),
      transaction({ element_out: 8, entry: 1, event: 3, kind: "w", result: "di" }),
      transaction({ element_out: 9, entry: 2, event: 4, kind: "f", result: "a" }),
      transaction({ element_out: 10, entry: 2, event: 4, kind: "x", result: "a" }),
    ])

    expect(drops).toEqual([
      { elementId: 7, entryId: 1, droppedEvent: 3 },
      { elementId: 9, entryId: 2, droppedEvent: 4 },
    ])
  })
})

describe("findReacquisitionEvent", () => {
  it("returns the event the same manager re-added the player", () => {
    const event = findReacquisitionEvent({ elementId: 7, entryId: 1, droppedEvent: 3 }, [
      transaction({ element_in: 7, entry: 1, event: 6, result: "a" }),
      transaction({ element_in: 7, entry: 1, event: 9, result: "a" }),
    ])

    expect(event).toBe(6)
  })

  it("ignores other managers and rejected claims", () => {
    const event = findReacquisitionEvent({ elementId: 7, entryId: 1, droppedEvent: 3 }, [
      transaction({ element_in: 7, entry: 2, event: 5, result: "a" }),
      transaction({ element_in: 7, entry: 1, event: 6, result: "di" }),
    ])

    expect(event).toBeNull()
  })
})

describe("sumPointsSince", () => {
  it("sums finished gameweeks from the drop until the reacquisition", () => {
    const result = sumPointsSince(
      { elementId: 7, entryId: 1, droppedEvent: 3 },
      6,
      new Map([
        [3, 10],
        [4, 2],
        [5, 8],
        [6, 99],
      ]),
      [3, 4, 5, 6],
    )

    expect(result).toEqual({ pointsSince: 20, gwsSince: 3 })
  })

  it("runs to the latest finished gameweek when the player never came back", () => {
    const result = sumPointsSince(
      { elementId: 7, entryId: 1, droppedEvent: 2 },
      null,
      new Map([
        [1, 5],
        [2, 6],
        [3, 7],
      ]),
      [1, 2, 3],
    )

    expect(result).toEqual({ pointsSince: 13, gwsSince: 2 })
  })

  it("ignores unfinished gameweeks", () => {
    const result = sumPointsSince(
      { elementId: 7, entryId: 1, droppedEvent: 1 },
      null,
      new Map([
        [1, 4],
        [2, 4],
      ]),
      [1],
    )

    expect(result).toEqual({ pointsSince: 4, gwsSince: 1 })
  })
})
