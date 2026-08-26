import type { Transaction } from "@pbd/types/fpl.types"

export type GotAwayDrop = {
  elementId: number
  entryId: number
  droppedEvent: number
}

export const collectDrops = (transactions: Transaction[]): GotAwayDrop[] =>
  transactions
    .filter((t) => t.result === "a" && (t.kind === "w" || t.kind === "f"))
    .map((t) => ({ elementId: t.element_out, entryId: t.entry, droppedEvent: t.event }))

export const findReacquisitionEvent = (
  drop: GotAwayDrop,
  transactions: Transaction[],
): number | null => {
  const reacquired = transactions
    .filter(
      (t) =>
        t.result === "a" &&
        t.element_in === drop.elementId &&
        t.entry === drop.entryId &&
        t.event > drop.droppedEvent,
    )
    .sort((a, b) => a.event - b.event)[0]
  return reacquired ? reacquired.event : null
}

export const sumPointsSince = (
  drop: GotAwayDrop,
  reacquiredEvent: number | null,
  gwPoints: Map<number, number>,
  finishedEvents: number[],
): { pointsSince: number; gwsSince: number } => {
  const end = reacquiredEvent === null ? Number.POSITIVE_INFINITY : reacquiredEvent - 1
  let pointsSince = 0
  let gwsSince = 0
  for (const event of finishedEvents) {
    if (event < drop.droppedEvent || event > end) continue
    pointsSince += gwPoints.get(event) ?? 0
    gwsSince++
  }
  return { pointsSince, gwsSince }
}
