import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import { SERVER_TTL, fetchFplSafe } from "@pbd/server/fpl/client"
import type { ElementSummaryResponse } from "@pbd/types/fpl.types"

export type ElementGameweekPoints = Map<number, Map<number, number>>

export const fetchElementGameweekPoints = async (
  elementIds: number[],
): Promise<ElementGameweekPoints> => {
  const summaries = await Promise.all(
    elementIds.map((elementId) =>
      fetchFplSafe<ElementSummaryResponse>(
        FPL_ENDPOINTS.elementSummary(elementId),
        SERVER_TTL.ELEMENT_SUMMARY,
      ),
    ),
  )

  const points: ElementGameweekPoints = new Map()
  for (const [index, elementId] of elementIds.entries()) {
    const summary = summaries[index]
    if (summary)
      points.set(elementId, new Map(summary.history.map((row) => [row.event, row.total_points])))
  }

  return points
}
