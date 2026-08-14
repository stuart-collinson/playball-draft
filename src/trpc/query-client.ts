import { FRESHNESS } from "@pbd/lib/freshness"
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query"
import { TRPCClientError } from "@trpc/client"

const MAX_RETRIES = 2

// Retry 5xx / network blips (the FPL API 502s routinely); surface 4xx
// immediately — a bad input never fixes itself by retrying.
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
        // Safety-net tier — every fpl query overrides this via fpl.cache.ts.
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
