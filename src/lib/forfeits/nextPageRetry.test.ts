import { retryForfeitsNextPage } from "@pbd/lib/forfeits/nextPageRetry"
import { TRPCClientError } from "@trpc/client"
import { describe, expect, it, vi } from "vitest"

const trpcError = (code: string) =>
  TRPCClientError.from({ error: { code: -32600, message: code, data: { code } } })

const queryFailingWith = (error: unknown) => ({
  error,
  fetchNextPage: vi.fn(async () => undefined),
  refetch: vi.fn(async () => undefined),
})

describe("retryForfeitsNextPage", () => {
  it("asks for the failed page again after a network or server error", async () => {
    const query = queryFailingWith(trpcError("INTERNAL_SERVER_ERROR"))

    await retryForfeitsNextPage(query)

    expect(query.fetchNextPage).toHaveBeenCalledTimes(1)
    expect(query.refetch).not.toHaveBeenCalled()
  })

  it("reloads the list from the top when the server rejected the cursor", async () => {
    const query = queryFailingWith(trpcError("BAD_REQUEST"))

    await retryForfeitsNextPage(query)

    expect(query.refetch).toHaveBeenCalledTimes(1)
    expect(query.fetchNextPage).not.toHaveBeenCalled()
  })

  it("asks for the failed page again when the error did not come from trpc", async () => {
    const query = queryFailingWith(new TypeError("Failed to fetch"))

    await retryForfeitsNextPage(query)

    expect(query.fetchNextPage).toHaveBeenCalledTimes(1)
  })
})
