import { forfeitsListOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import type { ForfeitsListInput } from "@pbd/lib/forfeits/filters"
import { nextPageRecovery } from "@pbd/lib/forfeits/nextPageRecovery"
import type { NextPageRecovery } from "@pbd/lib/forfeits/nextPageRecovery"
import { useTRPC } from "@pbd/trpc/react"
import { useQueryClient } from "@tanstack/react-query"

type FailedNextPage = {
  error: unknown
  fetchNextPage: () => Promise<unknown>
}

type NextPageRecoveryAction = {
  recovery: NextPageRecovery
  recover: () => void
}

export const useRecoverForfeitsNextPage = (
  input: ForfeitsListInput,
  { error, fetchNextPage }: FailedNextPage,
): NextPageRecoveryAction => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const recovery = nextPageRecovery(error)

  const recover = () => {
    if (recovery === "reset")
      void queryClient.resetQueries({
        queryKey: forfeitsListOptions(trpc, input).queryKey,
        exact: true,
      })
    else if (recovery === "reload") window.location.reload()
    else void fetchNextPage()
  }

  return { recovery, recover }
}
