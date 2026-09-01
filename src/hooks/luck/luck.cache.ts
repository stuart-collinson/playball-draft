import { FRESHNESS } from "@pbd/lib/freshness"
import type { useTRPC } from "@pbd/trpc/react"

type Trpc = ReturnType<typeof useTRPC>

export const luckListOptions = (trpc: Trpc) => ({
  ...trpc.luck.list.queryOptions(),
  ...FRESHNESS.gameweek,
})
