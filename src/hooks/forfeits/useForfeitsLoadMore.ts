import type { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { isReadyToLoadMore } from "@pbd/lib/forfeits/loadMore"
import type { ForfeitsLoadMoreFailure } from "@pbd/types/forfeits.types"
import { useCallback } from "react"

type ForfeitsListQuery = ReturnType<typeof useForfeitsList>

type ForfeitsLoadMore = {
  canLoadMore: boolean
  isLoadingNextPage: boolean
  failure: ForfeitsLoadMoreFailure | null
  loadMore: () => void
}

export const useForfeitsLoadMore = (query: ForfeitsListQuery): ForfeitsLoadMore => {
  const { error, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query
  const loadMore = useCallback(
    () => void fetchNextPage({ cancelRefetch: false }),
    [fetchNextPage],
  )

  return {
    canLoadMore: isReadyToLoadMore(query),
    isLoadingNextPage: isFetchingNextPage,
    failure: isFetchNextPageError
      ? { error, isRetrying: isFetchingNextPage, retry: loadMore }
      : null,
    loadMore,
  }
}
