import { isClientError } from "@pbd/trpc/errors"
import { TRPCClientError } from "@trpc/client"
import { describe, expect, it } from "vitest"

const trpcError = (code: string, httpStatus: number) =>
  TRPCClientError.from({ error: { code: -32600, message: code, data: { code, httpStatus } } })

describe("isClientError", () => {
  it("is true for a request the server refused, which asking again won't change", () => {
    expect(isClientError(trpcError("UNAUTHORIZED", 401))).toBe(true)
    expect(isClientError(trpcError("BAD_REQUEST", 400))).toBe(true)
  })

  it("is false for a server error", () => {
    expect(isClientError(trpcError("INTERNAL_SERVER_ERROR", 500))).toBe(false)
  })

  it("is false for a failure that never reached the server", () => {
    expect(isClientError(new TypeError("Failed to fetch"))).toBe(false)
  })
})
