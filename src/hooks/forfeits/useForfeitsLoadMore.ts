import type { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { loadMoreState } from "@pbd/lib/forfeits/loadMore"
import { useCallback } from "react"

type ForfeitsListQuery = ReturnType<typeof useForfeitsList>

type LoadMoreFailure = {
  error: unknown
  isRetrying: boolean
  retry: () => void
}

type ForfeitsLoadMore = {
  canLoadMore: boolean
  isLoadingMore: boolean
  failure: LoadMoreFailure | null
  loadMore: () => void
}

export const useForfeitsLoadMore = (query: ForfeitsListQuery): ForfeitsLoadMore => {
  const { error, fetchNextPage, refetch } = query
  const loadMore = useCallback(() => void fetchNextPage(), [fetchNextPage])
  const refetchLoadedPages = useCallback(() => void refetch(), [refetch])
  const { canLoadMore, isLoadingMore, hasFailed, retryRefetchesLoadedPages } = loadMoreState(query)

  return {
    canLoadMore,
    isLoadingMore,
    failure: hasFailed
      ? {
          error,
          isRetrying: isLoadingMore,
          retry: retryRefetchesLoadedPages ? refetchLoadedPages : loadMore,
        }
      : null,
    loadMore,
  }
}
