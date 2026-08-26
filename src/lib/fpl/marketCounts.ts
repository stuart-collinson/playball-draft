import type { Transaction } from "@pbd/types/fpl.types"

export type MarketCount = { elementId: number; count: number }

const topCounts = (elementIds: number[], limit: number): MarketCount[] => {
  const counts = new Map<number, number>()
  for (const elementId of elementIds) counts.set(elementId, (counts.get(elementId) ?? 0) + 1)
  return [...counts.entries()]
    .map(([elementId, count]) => ({ elementId, count }))
    .sort((a, b) => b.count - a.count || a.elementId - b.elementId)
    .slice(0, limit)
}

export const countAddedElements = (transactions: Transaction[], limit: number): MarketCount[] =>
  topCounts(
    transactions.filter((t) => t.result === "a").map((t) => t.element_in),
    limit,
  )

export const countDroppedElements = (transactions: Transaction[], limit: number): MarketCount[] =>
  topCounts(
    transactions.filter((t) => t.result === "a").map((t) => t.element_out),
    limit,
  )

export const countWantedElements = (transactions: Transaction[], limit: number): MarketCount[] =>
  topCounts(
    transactions.filter((t) => t.kind === "w").map((t) => t.element_in),
    limit,
  )
