import { elementSummariesOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useElementSummaries = (elementIds: number[]) => {
  const trpc = useTRPC()

  return useQuery({
    ...elementSummariesOptions(trpc, elementIds),
    enabled: elementIds.length > 0,
  })
}
