import type { ForfeitsListInput } from "@pbd/lib/forfeits"
import { FRESHNESS } from "@pbd/lib/freshness"
import type { useTRPC } from "@pbd/trpc/react"

type Trpc = ReturnType<typeof useTRPC>

export const forfeitsListOptions = (trpc: Trpc, input: ForfeitsListInput) => ({
  ...trpc.forfeits.list.infiniteQueryOptions(input, {
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  }),
  ...FRESHNESS.matchDay,
})

export const forfeitDetailOptions = (trpc: Trpc, id: string) => ({
  ...trpc.forfeits.detail.queryOptions({ id }),
  ...FRESHNESS.gameweek,
})
