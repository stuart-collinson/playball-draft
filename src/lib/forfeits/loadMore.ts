type LoadMoreFlags = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  isRefetching: boolean
  isRefetchError: boolean
}

type LoadMoreState = {
  canLoadMore: boolean
  isLoadingMore: boolean
  hasFailed: boolean
  retryRefetchesLoadedPages: boolean
}

export const loadMoreState = (flags: LoadMoreFlags): LoadMoreState => {
  const isLoadingMore = flags.isFetchingNextPage || flags.isRefetching
  const hasFailed = flags.isFetchNextPageError || flags.isRefetchError

  return {
    canLoadMore: flags.hasNextPage && !hasFailed && !isLoadingMore,
    isLoadingMore,
    hasFailed,
    retryRefetchesLoadedPages: flags.isRefetchError,
  }
}
