type LoadMoreFlags = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  isRefetching: boolean
}

export const isReadyToLoadMore = (flags: LoadMoreFlags): boolean =>
  flags.hasNextPage &&
  !flags.isFetchingNextPage &&
  !flags.isFetchNextPageError &&
  !flags.isRefetching
