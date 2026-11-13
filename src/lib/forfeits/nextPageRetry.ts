import { TRPCClientError } from "@trpc/client"

type NextPageQuery = {
  error: unknown
  fetchNextPage: () => Promise<unknown>
  refetch: () => Promise<unknown>
}

const REJECTED_INPUT_CODE = "BAD_REQUEST"

const isRejectedCursor = (error: unknown): boolean =>
  error instanceof TRPCClientError &&
  (error.data as { code?: string } | null)?.code === REJECTED_INPUT_CODE

export const retryForfeitsNextPage = (query: NextPageQuery): Promise<unknown> =>
  isRejectedCursor(query.error) ? query.refetch() : query.fetchNextPage()
