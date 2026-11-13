import { encodeForfeitsCursor, readForfeitsCursor } from "@pbd/lib/forfeits/cursor"
import type { ForfeitsCursor } from "@pbd/lib/forfeits/cursor"
import { describe, expect, it } from "vitest"

const CURSOR = {
  season: "2026/27",
  gameweek: "10",
  createdAt: "2026-08-28T12:00:00.000Z",
  id: "0b6f2c1e-1111-4222-8333-444455556666",
}

const positionIn = (token: string): ForfeitsCursor | null => {
  const read = readForfeitsCursor(token)
  return read.kind === "position" ? read.cursor : null
}

const uploadOrderToken = (fields: Record<string, unknown>): string =>
  Buffer.from(JSON.stringify(fields)).toString("base64url")

describe("forfeits cursor", () => {
  it("round-trips a cursor through encode and decode", () => {
    expect(positionIn(encodeForfeitsCursor(CURSOR))).toEqual(CURSOR)
  })

  it("round-trips a cursor positioned on an annual forfeit", () => {
    const annual = { ...CURSOR, gameweek: "annual" }

    expect(positionIn(encodeForfeitsCursor(annual))).toEqual(annual)
  })

  it("produces a url-safe token", () => {
    expect(encodeForfeitsCursor(CURSOR)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it("rejects garbage", () => {
    expect(positionIn("not-a-cursor")).toBeNull()
  })

  it("rejects valid base64 that is not a cursor", () => {
    expect(positionIn(Buffer.from('{"foo":1}').toString("base64url"))).toBeNull()
  })

  it("rejects an empty token", () => {
    expect(positionIn("")).toBeNull()
  })

  it("rejects a cursor from before forfeits were ordered by gameweek", () => {
    const token = Buffer.from(
      JSON.stringify({ createdAt: CURSOR.createdAt, id: CURSOR.id }),
    ).toString("base64url")

    expect(positionIn(token)).toBeNull()
  })

  it("recognises a cursor from the upload-order list that older tabs still hold", () => {
    const token = uploadOrderToken({ createdAt: CURSOR.createdAt, id: CURSOR.id })

    expect(readForfeitsCursor(token)).toEqual({ kind: "uploadOrder" })
  })

  it("doesn't mistake a current cursor or garbage for an upload-order cursor", () => {
    expect(readForfeitsCursor(encodeForfeitsCursor(CURSOR)).kind).toBe("position")
    expect(readForfeitsCursor("not-a-cursor")).toEqual({ kind: "unreadable" })
    expect(readForfeitsCursor(uploadOrderToken({ createdAt: "x", id: "y" }))).toEqual({
      kind: "unreadable",
    })
  })

  it("accepts any season the database holds, since the column has no format constraint", () => {
    const imported = { ...CURSOR, season: "2025-26" }

    expect(positionIn(encodeForfeitsCursor(imported))).toEqual(imported)
  })

  it("rejects a cursor whose season is not text", () => {
    const token = Buffer.from(JSON.stringify({ ...CURSOR, season: 2026 })).toString("base64url")

    expect(positionIn(token)).toBeNull()
  })

  it("rejects a gameweek the gameweek column's check constraint wouldn't hold", () => {
    for (const gameweek of ["39", "0", "05", "GW5"]) {
      expect(positionIn(encodeForfeitsCursor({ ...CURSOR, gameweek }))).toBeNull()
    }
  })

  it("rejects a cursor whose gameweek is not text", () => {
    const token = Buffer.from(JSON.stringify({ ...CURSOR, gameweek: 10 })).toString("base64url")

    expect(positionIn(token)).toBeNull()
  })

  it("rejects a well-typed cursor whose createdAt is not a timestamp", () => {
    const token = encodeForfeitsCursor({ ...CURSOR, createdAt: "banana" })

    expect(positionIn(token)).toBeNull()
  })

  it("rejects a createdAt that javascript can read but postgres cannot", () => {
    expect(positionIn(encodeForfeitsCursor({ ...CURSOR, createdAt: "1" }))).toBeNull()
    expect(positionIn(encodeForfeitsCursor({ ...CURSOR, createdAt: "August 28, 2026" }))).toBeNull()
  })

  it("rejects a timestamp in any shape the server doesn't issue", () => {
    for (const createdAt of [
      "2026-08-28T13:00:00.000+01:00",
      "2026-08-28T12:00:00Z",
      "2024-02-30T00:00:00.000Z",
      "0000-01-01T00:00:00.000Z",
    ]) {
      expect(positionIn(encodeForfeitsCursor({ ...CURSOR, createdAt }))).toBeNull()
    }
  })

  it("rejects a season or gameweek that postgres can't hold as text", () => {
    expect(positionIn(encodeForfeitsCursor({ ...CURSOR, season: "2026\u0000" }))).toBeNull()
    expect(positionIn(encodeForfeitsCursor({ ...CURSOR, gameweek: "1\u0000" }))).toBeNull()
  })

  it("rejects a well-typed cursor whose id is not a uuid", () => {
    const token = encodeForfeitsCursor({ ...CURSOR, id: "not-a-uuid" })

    expect(positionIn(token)).toBeNull()
  })
})
