import { FRESHNESS } from "@pbd/lib/freshness"
import { trpcErrorData } from "@pbd/trpc/errors"
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query"

const MAX_RETRIES = 2

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  const httpStatus = trpcErrorData(error)?.httpStatus
  if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) return false
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
