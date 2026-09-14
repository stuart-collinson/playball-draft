import {
  buildTradeAcquisitions,
  buildTradeDrops,
  findOwnershipEnd,
  isAcceptedPickup,
  sumPointsWhileOwned,
} from "@pbd/lib/fpl/ownership"
import type { Trade, Transaction } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const transaction = (overrides: Partial<Transaction>): Transaction => ({
  added: "2026-09-01T12:00:00Z",
  element_in: 0,
  element_out: 0,
  entry: 0,
  event: 0,
  id: 1,
  index: null,
  kind: "w",
  priority: null,
  result: "a",
  note: null,
  ...overrides,
})

const trade = (overrides: Partial<Trade>): Trade => ({
  event: 5,
  id: 1,
  offered_entry: 10,
  received_entry: 20,
  offer_time: "2026-09-01T12:00:00Z",
  response_time: "2026-09-01T13:00:00Z",
  state: "a",
  tradeitem_set: [],
  ...overrides,
})

describe("buildTradeDrops", () => {
  it("records both sides of every trade item", () => {
    const trades = [trade({ tradeitem_set: [{ element_in: 101, element_out: 202 }] })]

    const drops = buildTradeDrops(trades)

    expect(drops).toEqual([
      { element: 202, entryId: 10, event: 5 },
      { element: 101, entryId: 20, event: 5 },
    ])
  })

  it("returns nothing for a trade with no items", () => {
    expect(buildTradeDrops([trade({})])).toEqual([])
  })
})

describe("findOwnershipEnd", () => {
  it("ends ownership the event before the earliest accepted transaction drop", () => {
    const txs = [transaction({ element_out: 7, entry: 1, event: 10, result: "a" })]

    expect(findOwnershipEnd(7, 1, 4, txs, [], 15)).toBe(9)
  })

  it("ignores drops made by other entries", () => {
    const txs = [transaction({ element_out: 7, entry: 99, event: 10, result: "a" })]

    expect(findOwnershipEnd(7, 1, 4, txs, [], 15)).toBe(15)
  })

  it("ignores transactions that were not accepted", () => {
    const txs = [transaction({ element_out: 7, entry: 1, event: 10, result: "r" })]

    expect(findOwnershipEnd(7, 1, 4, txs, [], 15)).toBe(15)
  })

  it("detects a pickup and drop within the same gameweek", () => {
    const txs = [transaction({ element_out: 7, entry: 1, event: 4, result: "a" })]

    expect(findOwnershipEnd(7, 1, 4, txs, [], 15)).toBe(3)
  })

  it("uses the trade drop when it comes before the transaction drop", () => {
    const txs = [transaction({ element_out: 7, entry: 1, event: 12, result: "a" })]
    const tradeDrops = [{ element: 7, entryId: 1, event: 8 }]

    expect(findOwnershipEnd(7, 1, 4, txs, tradeDrops, 15)).toBe(7)
  })

  it("caps ownership at the current event when the player was never dropped", () => {
    expect(findOwnershipEnd(7, 1, 4, [], [], 15)).toBe(15)
  })
})

describe("buildTradeAcquisitions", () => {
  it("records the incoming side of every trade item for each manager", () => {
    const trades = [trade({ tradeitem_set: [{ element_in: 101, element_out: 202 }] })]

    expect(buildTradeAcquisitions(trades)).toEqual([
      { element: 101, entryId: 10, event: 5 },
      { element: 202, entryId: 20, event: 5 },
    ])
  })

  it("mirrors the drops so every acquisition has a matching drop on the other side", () => {
    const trades = [trade({ tradeitem_set: [{ element_in: 101, element_out: 202 }] })]

    const acquired = buildTradeAcquisitions(trades)
      .map((record) => record.element)
      .sort()
    const dropped = buildTradeDrops(trades)
      .map((record) => record.element)
      .sort()

    expect(acquired).toEqual(dropped)
  })
})

describe("isAcceptedPickup", () => {
  it("accepts a completed waiver", () => {
    expect(isAcceptedPickup(transaction({ kind: "w", result: "a" }))).toBe(true)
  })

  it("accepts a completed free agent signing", () => {
    expect(isAcceptedPickup(transaction({ kind: "f", result: "a" }))).toBe(true)
  })

  it("rejects a waiver that was not processed", () => {
    expect(isAcceptedPickup(transaction({ kind: "w", result: "r" }))).toBe(false)
  })

  it("rejects other transaction kinds", () => {
    expect(isAcceptedPickup(transaction({ kind: "t", result: "a" }))).toBe(false)
  })
})

describe("sumPointsWhileOwned", () => {
  const gwPoints = new Map([
    [3, 5],
    [4, 8],
    [5, 2],
    [6, 11],
  ])

  it("adds the points from every finished gameweek in the ownership window", () => {
    expect(sumPointsWhileOwned(3, 5, gwPoints, new Set([3, 4, 5, 6]))).toEqual({
      points: 15,
      gwsOwned: 3,
    })
  })

  it("skips gameweeks that have not finished", () => {
    expect(sumPointsWhileOwned(3, 6, gwPoints, new Set([3, 4]))).toEqual({
      points: 13,
      gwsOwned: 2,
    })
  })

  it("counts a finished gameweek with no recorded points as owned but scoreless", () => {
    expect(sumPointsWhileOwned(3, 4, new Map(), new Set([3, 4]))).toEqual({
      points: 0,
      gwsOwned: 2,
    })
  })

  it("returns nothing when the ownership window is empty", () => {
    expect(sumPointsWhileOwned(7, 6, gwPoints, new Set([6, 7]))).toEqual({
      points: 0,
      gwsOwned: 0,
    })
  })

  it("treats a missing points map as zero points", () => {
    expect(sumPointsWhileOwned(3, 3, undefined, new Set([3]))).toEqual({ points: 0, gwsOwned: 1 })
  })
})
