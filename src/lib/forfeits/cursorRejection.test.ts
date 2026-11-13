import { isRejectedCursorError } from "@pbd/lib/forfeits/cursorRejection"
import { TRPCClientError } from "@trpc/client"
import { describe, expect, it } from "vitest"

const trpcError = (code: string, httpStatus: number) =>
  TRPCClientError.from({ error: { code: -32600, message: code, data: { code, httpStatus } } })

describe("isRejectedCursorError", () => {
  it("is true when the server refused the request's input, such as a stale cursor", () => {
    expect(isRejectedCursorError(trpcError("BAD_REQUEST", 400))).toBe(true)
  })

  it("is false when the viewer is locked out, so their loaded pages are kept", () => {
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
