import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query"
import { QUERY_CONFIG } from "@pbd/lib/constants/app"

export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.STALE_TIME,
        gcTime: QUERY_CONFIG.GC_TIME,
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  })
