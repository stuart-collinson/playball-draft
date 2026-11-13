import { isClientErrorResponse } from "@pbd/trpc/errors"
import { TRPCClientError } from "@trpc/client"
import { describe, expect, it } from "vitest"

const trpcError = (httpStatus: number) =>
  TRPCClientError.from({ error: { code: -32600, message: "failed", data: { httpStatus } } })

describe("isClientErrorResponse", () => {
  it("is true for a 4xx answer, which asking again cannot fix", () => {
    expect(isClientErrorResponse(trpcError(400))).toBe(true)
    expect(isClientErrorResponse(trpcError(404))).toBe(true)
  })

  it("is false for a 5xx answer, which may succeed if asked again", () => {
    expect(isClientErrorResponse(trpcError(500))).toBe(false)
    expect(isClientErrorResponse(trpcError(502))).toBe(false)
  })

  it("is false for a failure that never reached the server", () => {
    expect(isClientErrorResponse(new TypeError("Failed to fetch"))).toBe(false)
  })
})
