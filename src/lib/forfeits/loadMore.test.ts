import { isReadyToLoadMore } from "@pbd/lib/forfeits/loadMore"
import { describe, expect, it } from "vitest"

const IDLE = {
  hasNextPage: true,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  isRefetching: false,
}

describe("isReadyToLoadMore", () => {
  it("loads more when there's another page and nothing is in flight or failed", () => {
    expect(isReadyToLoadMore(IDLE)).toBe(true)
  })

  it("waits for a refetch, so loading more can't cancel it", () => {
    expect(isReadyToLoadMore({ ...IDLE, isRefetching: true })).toBe(false)
  })

  it("waits for the next page already on its way", () => {
    expect(isReadyToLoadMore({ ...IDLE, isFetchingNextPage: true })).toBe(false)
  })

  it("stops on a failed next page until it's retried", () => {
    expect(isReadyToLoadMore({ ...IDLE, isFetchNextPageError: true })).toBe(false)
  })

  it("has nothing to load after the last page", () => {
    expect(isReadyToLoadMore({ ...IDLE, hasNextPage: false })).toBe(false)
  })
})
