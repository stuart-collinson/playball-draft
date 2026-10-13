import type { Trade, Transaction } from "@pbd/types/fpl.types"

export type OwnershipRecord = { element: number; entryId: number; event: number }

export type PickupKind = "w" | "f"

export type OwnedPoints = { points: number; gwsOwned: number }

const ACCEPTED_RESULT = "a"

export const isAcceptedPickup = (
  transaction: Transaction,
): transaction is Transaction & { kind: PickupKind } =>
  (transaction.kind === "w" || transaction.kind === "f") && transaction.result === ACCEPTED_RESULT

export const buildTradeDrops = (trades: Trade[]): OwnershipRecord[] =>
  trades.flatMap((trade) =>
    trade.tradeitem_set.flatMap((item) => [
      { element: item.element_out, entryId: trade.offered_entry, event: trade.event },
      { element: item.element_in, entryId: trade.received_entry, event: trade.event },
    ]),
  )

export const buildTradeAcquisitions = (trades: Trade[]): OwnershipRecord[] =>
  trades.flatMap((trade) =>
    trade.tradeitem_set.flatMap((item) => [
      { element: item.element_in, entryId: trade.offered_entry, event: trade.event },
      { element: item.element_out, entryId: trade.received_entry, event: trade.event },
    ]),
  )

export const findOwnershipEnd = (
  elementId: number,
  entryId: number,
  startGw: number,
  transactions: Transaction[],
  tradeDrops: OwnershipRecord[],
  currentEvent: number,
): number => {
  const txDrop = transactions
    .filter(
      (t) =>
        t.element_out === elementId &&
        t.entry === entryId &&
        t.result === ACCEPTED_RESULT &&
        t.event >= startGw,
    )
    .sort((a, b) => a.event - b.event)[0]

  const tradeDrop = tradeDrops
    .filter((d) => d.element === elementId && d.entryId === entryId && d.event >= startGw)
    .sort((a, b) => a.event - b.event)[0]

  const txEndGw = txDrop ? txDrop.event - 1 : Number.POSITIVE_INFINITY
  const tradeEndGw = tradeDrop ? tradeDrop.event - 1 : Number.POSITIVE_INFINITY

  return Math.min(txEndGw, tradeEndGw, currentEvent)
}

export const sumPointsWhileOwned = (
  startGw: number,
  endGw: number,
  gwPoints: Map<number, number> | undefined,
  finishedGws: Set<number>,
): OwnedPoints => {
  let points = 0
  let gwsOwned = 0

  for (let gw = startGw; gw <= endGw; gw++) {
    if (!finishedGws.has(gw)) continue
    points += gwPoints?.get(gw) ?? 0
    gwsOwned++
  }

  return { points, gwsOwned }
}
