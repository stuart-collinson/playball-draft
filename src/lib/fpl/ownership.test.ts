import { buildTradeDrops, findOwnershipEnd } from "@pbd/lib/fpl/ownership"
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
