import { marketReportOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useMarketReport = (input: RouterInput["fpl"]["marketReport"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(marketReportOptions(trpc, input))
}
