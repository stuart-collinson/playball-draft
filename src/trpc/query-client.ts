import { FRESHNESS } from "@pbd/lib/freshness"
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query"
import { TRPCClientError } from "@trpc/client"

const MAX_RETRIES = 2

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof TRPCClientError) {
    const httpStatus = (error.data as { httpStatus?: number } | null)?.httpStatus
    if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) return false
  }
  return failureCount < MAX_RETRIES
}

export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        ...FRESHNESS.live,
        refetchOnWindowFocus: true,
        retry: shouldRetry,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  })
