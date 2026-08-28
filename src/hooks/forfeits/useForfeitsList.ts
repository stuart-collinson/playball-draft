import { forfeitsListOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import type { ForfeitsListInput } from "@pbd/lib/forfeits"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"

export const useForfeitsList = (input: ForfeitsListInput) => {
  const trpc = useTRPC()

  return useSuspenseInfiniteQuery(forfeitsListOptions(trpc, input))
}
