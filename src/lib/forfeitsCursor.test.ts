import { decodeForfeitsCursor, encodeForfeitsCursor } from "@pbd/lib/forfeitsCursor"
import { describe, expect, it } from "vitest"

const CURSOR = { createdAt: "2026-08-28T12:00:00.000Z", id: "0b6f2c1e-1111-4222-8333-444455556666" }

describe("forfeits cursor", () => {
  it("round-trips a cursor through encode and decode", () => {
    expect(decodeForfeitsCursor(encodeForfeitsCursor(CURSOR))).toEqual(CURSOR)
  })

  it("produces a url-safe token", () => {
    expect(encodeForfeitsCursor(CURSOR)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it("rejects garbage", () => {
    expect(decodeForfeitsCursor("not-a-cursor")).toBeNull()
  })

  it("rejects valid base64 that is not a cursor", () => {
    expect(decodeForfeitsCursor(Buffer.from('{"foo":1}').toString("base64url"))).toBeNull()
  })

  it("rejects an empty token", () => {
    expect(decodeForfeitsCursor("")).toBeNull()
  })

  it("rejects a well-typed cursor whose createdAt is not a timestamp", () => {
    const token = encodeForfeitsCursor({ createdAt: "banana", id: CURSOR.id })

    expect(decodeForfeitsCursor(token)).toBeNull()
  })

  it("rejects a well-typed cursor whose id is not a uuid", () => {
    const token = encodeForfeitsCursor({ createdAt: CURSOR.createdAt, id: "not-a-uuid" })

    expect(decodeForfeitsCursor(token)).toBeNull()
  })
})
