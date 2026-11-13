import { forfeitsListOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import { isRejectedCursorError } from "@pbd/lib/forfeits/cursorRejection"
import type { ForfeitsListInput } from "@pbd/lib/forfeits/filters"
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
    if (isRejectedCursorError(error))
      void queryClient.resetQueries({
        queryKey: forfeitsListOptions(trpc, input).queryKey,
        exact: true,
      })
    else void fetchNextPage()
  }
}
