import { forfeitsListOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import type { ForfeitsListInput } from "@pbd/lib/forfeits/filters"
import { isClientErrorResponse } from "@pbd/trpc/errors"
import { useTRPC } from "@pbd/trpc/react"
import { useQueryClient } from "@tanstack/react-query"

type FailedNextPage = {
  error: unknown
  fetchNextPage: () => Promise<unknown>
}

export const useRetryForfeitsNextPage = (
  input: ForfeitsListInput,
  { error, fetchNextPage }: FailedNextPage,
): (() => void) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return () => {
    if (isClientErrorResponse(error))
      void queryClient.resetQueries({ queryKey: forfeitsListOptions(trpc, input).queryKey })
    else void fetchNextPage()
  }
}
