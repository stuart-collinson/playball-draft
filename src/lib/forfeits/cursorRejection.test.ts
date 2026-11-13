import { STALE_FORFEITS_CURSOR_CODE } from "@pbd/lib/constants/Forfeits"
import { isRejectedCursorError } from "@pbd/lib/forfeits/cursorRejection"
import { TRPCClientError } from "@trpc/client"
import { describe, expect, it } from "vitest"

const trpcError = (code: string, httpStatus: number) =>
  TRPCClientError.from({ error: { code: -32600, message: code, data: { code, httpStatus } } })

describe("isRejectedCursorError", () => {
  it("is true when the server says the cursor no longer matches the list", () => {
    expect(isRejectedCursorError(trpcError(STALE_FORFEITS_CURSOR_CODE, 409))).toBe(true)
  })

  it("is false for any other refused input, so loaded pages are kept", () => {
    expect(isRejectedCursorError(trpcError("BAD_REQUEST", 400))).toBe(false)
  })

  it("is false when the viewer is locked out", () => {
    expect(isRejectedCursorError(trpcError("UNAUTHORIZED", 401))).toBe(false)
  })

  it("is false for a rate limit or timeout, which may pass if asked again", () => {
    expect(isRejectedCursorError(trpcError("TOO_MANY_REQUESTS", 429))).toBe(false)
    expect(isRejectedCursorError(trpcError("TIMEOUT", 408))).toBe(false)
  })

  it("is false for a server error or a failure that never reached the server", () => {
    expect(isRejectedCursorError(trpcError("INTERNAL_SERVER_ERROR", 500))).toBe(false)
    expect(isRejectedCursorError(new TypeError("Failed to fetch"))).toBe(false)
  })
})
