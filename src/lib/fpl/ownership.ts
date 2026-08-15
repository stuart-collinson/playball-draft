import type { Trade, Transaction } from "@pbd/types/fpl.types"

export type TradeDropRecord = { element: number; entryId: number; event: number }

// Trades move players only once PROCESSED. "Accepted" (a) is still in-flight
// awaiting the veto window, and offered/withdrawn/rejected/invalid/vetoed/
// expired trades never move anyone — counting those fabricated drops that
// truncated ownership windows and made players vanish from the stats tables.
const PROCESSED_TRADE_STATE = "p"

export const isProcessedTrade = (trade: Trade): boolean => trade.state === PROCESSED_TRADE_STATE

export const buildTradeDrops = (trades: Trade[]): TradeDropRecord[] => {
  const drops: TradeDropRecord[] = []
  for (const trade of trades) {
    if (!isProcessedTrade(trade)) continue
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

// Points a player scored while owned, counting only finished gameweeks —
// alongside how many of those gameweeks the ownership covered.
export const sumOwnershipPoints = (
  gwPoints: Map<number, number> | undefined,
  startGw: number,
  endGw: number,
  finishedGws: Set<number>,
): { points: number; gwsOwned: number } => {
  let points = 0
  let gwsOwned = 0
  for (let gw = startGw; gw <= endGw; gw++) {
    if (!finishedGws.has(gw)) continue
    points += gwPoints?.get(gw) ?? 0
    gwsOwned++
  }

  return { points, gwsOwned }
}

// The gameweek a manager stopped owning a player: the event before their
// earliest drop (waiver/free-agent transaction or trade), capped at the
// current event when they still hold them.
export const findOwnershipEnd = (
  elementId: number,
  entryId: number,
  startGw: number,
  transactions: Transaction[],
  tradeDrops: TradeDropRecord[],
  currentEvent: number,
): number => {
  // Use >= startGw so same-GW drops (pick up and drop in the same waiver window) are detected
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
