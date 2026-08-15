import type { Trade, Transaction } from "@pbd/types/fpl.types"

export type TradeDropRecord = { element: number; entryId: number; event: number }

export const buildTradeDrops = (trades: Trade[]): TradeDropRecord[] => {
  const drops: TradeDropRecord[] = []
  for (const trade of trades) {
    for (const item of trade.tradeitem_set) {
      drops.push({
        element: item.element_out,
        entryId: trade.offered_entry,
        event: trade.event,
      })
      drops.push({
        element: item.element_in,
        entryId: trade.received_entry,
        event: trade.event,
      })
    }
  }
  return drops
}

export const findOwnershipEnd = (
  elementId: number,
  entryId: number,
  startGw: number,
  transactions: Transaction[],
  tradeDrops: TradeDropRecord[],
  currentEvent: number,
): number => {
  const txDrop = transactions
    .filter(
      (t) =>
        t.element_out === elementId &&
        t.entry === entryId &&
        t.result === "a" &&
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
