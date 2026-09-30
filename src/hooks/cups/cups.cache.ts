import { FRESHNESS } from "@pbd/lib/freshness"
import type { useTRPC } from "@pbd/trpc/react"

type Trpc = ReturnType<typeof useTRPC>

export const cupsListOptions = (trpc: Trpc) => ({
  ...trpc.cups.list.queryOptions(),
  ...FRESHNESS.gameweek,
})

export const cupDetailOptions = (trpc: Trpc, cupId: string) => ({
  ...trpc.cups.detail.queryOptions({ cupId }),
  ...FRESHNESS.gameweek,
})

export const cupScheduleWindowOptions = (trpc: Trpc) => ({
  ...trpc.cups.scheduleWindow.queryOptions(),
  ...FRESHNESS.stable,
})
