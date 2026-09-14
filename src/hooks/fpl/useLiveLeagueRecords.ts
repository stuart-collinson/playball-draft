import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { mergeEntryRecords } from "@pbd/lib/fpl/entryRecords"
import type { AppRouter } from "@pbd/server/routers/index"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQueries } from "@tanstack/react-query"
import type { UseSuspenseQueryOptions } from "@tanstack/react-query"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { TRPCQueryKey } from "@trpc/tanstack-react-query"

type Trpc = ReturnType<typeof useTRPC>

type LeagueRecordOptions<T> = (
  trpc: Trpc,
  leagueIds: number[],
) => UseSuspenseQueryOptions<
  Record<number, T>,
  TRPCClientErrorLike<AppRouter>,
  Record<number, T>,
  TRPCQueryKey
>

export const useLiveLeagueRecords = <T>(
  leagueIds: number[],
  optionsFor: LeagueRecordOptions<T>,
): { data: Record<number, T> } => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()

  return useSuspenseQueries({
    queries: leagueIds.map((leagueId) => ({ ...optionsFor(trpc, [leagueId]), ...liveFreshness })),
    combine: (results) => ({ data: mergeEntryRecords(results.map((result) => result.data)) }),
  })
}
