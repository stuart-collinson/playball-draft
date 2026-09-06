import { FRESHNESS } from "@pbd/lib/freshness"
import type { useTRPC } from "@pbd/trpc/react"

type Trpc = ReturnType<typeof useTRPC>

export const survivalStreaksOptions = (trpc: Trpc) => ({
  ...trpc.survival.list.queryOptions(),
  ...FRESHNESS.gameweek,
})
