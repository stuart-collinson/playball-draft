import { STALE_FORFEITS_CURSOR_CODE } from "@pbd/lib/constants/Forfeits"
import { nextPageRecovery } from "@pbd/lib/forfeits/nextPageRecovery"
import { TRPCClientError } from "@trpc/client"
import { describe, expect, it } from "vitest"

const trpcError = (code: string, httpStatus: number) =>
  TRPCClientError.from({ error: { code: -32600, message: code, data: { code, httpStatus } } })

describe("nextPageRecovery", () => {
  it("resets the list when the server says the cursor no longer matches it", () => {
    expect(nextPageRecovery(trpcError(STALE_FORFEITS_CURSOR_CODE, 409))).toBe("reset")
  })

  it("reloads the page when asking again can't help, like an expired gate cookie", () => {
    expect(nextPageRecovery(trpcError("UNAUTHORIZED", 401))).toBe("reload")
    expect(nextPageRecovery(trpcError("BAD_REQUEST", 400))).toBe("reload")
  })

  it("asks again after a rate limit or timeout, which may pass", () => {
    expect(nextPageRecovery(trpcError("TOO_MANY_REQUESTS", 429))).toBe("retry")
    expect(nextPageRecovery(trpcError("TIMEOUT", 408))).toBe("retry")
  })

  it("asks again after a server error or a failure that never reached the server", () => {
    expect(nextPageRecovery(trpcError("INTERNAL_SERVER_ERROR", 500))).toBe("retry")
    expect(nextPageRecovery(new TypeError("Failed to fetch"))).toBe("retry")
  })
})
