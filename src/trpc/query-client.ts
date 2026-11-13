import { FRESHNESS } from "@pbd/lib/freshness"
import { isClientErrorStatus, trpcErrorData } from "@pbd/trpc/errors"
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query"

const MAX_RETRIES = 2

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (isClientErrorStatus(trpcErrorData(error)?.httpStatus)) return false
  return failureCount < MAX_RETRIES
}

export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        ...FRESHNESS.matchDay,
        refetchOnWindowFocus: true,
        retry: shouldRetry,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  })
