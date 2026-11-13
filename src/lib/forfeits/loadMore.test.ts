import { loadMoreState } from "@pbd/lib/forfeits/loadMore"
import { describe, expect, it } from "vitest"

const IDLE = {
  hasNextPage: true,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  isRefetching: false,
  isRefetchError: false,
}

describe("loadMoreState", () => {
  it("loads more when there's another page and nothing is in flight or failed", () => {
    expect(loadMoreState(IDLE)).toEqual({
      canLoadMore: true,
      isLoadingMore: false,
      hasFailed: false,
      retryRefetchesLoadedPages: false,
    })
  })

  it("waits for a refetch, so loading more can't cancel it", () => {
    expect(loadMoreState({ ...IDLE, isRefetching: true })).toMatchObject({
      canLoadMore: false,
      isLoadingMore: true,
    })
  })

  it("stops on a failed next page and retries just that page", () => {
    expect(loadMoreState({ ...IDLE, isFetchNextPageError: true })).toMatchObject({
      canLoadMore: false,
      hasFailed: true,
      retryRefetchesLoadedPages: false,
    })
  })

  it("stops on a failed refetch and retries by refetching the loaded pages", () => {
    expect(loadMoreState({ ...IDLE, isRefetchError: true })).toMatchObject({
      canLoadMore: false,
      hasFailed: true,
      retryRefetchesLoadedPages: true,
    })
  })

  it("has nothing to load after the last page", () => {
    expect(loadMoreState({ ...IDLE, hasNextPage: false }).canLoadMore).toBe(false)
  })
})
