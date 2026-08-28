import { computeGateToken, isGateTokenValid, isPasswordMatch } from "@pbd/lib/forfeitsGate"
import { describe, expect, it } from "vitest"

const PASSWORD = "correct-horse-battery-staple"

describe("computeGateToken", () => {
  it("produces the same token for the same password and audience", () => {
    expect(computeGateToken(PASSWORD, "view")).toBe(computeGateToken(PASSWORD, "view"))
  })

  it("produces different tokens for view and upload", () => {
    expect(computeGateToken(PASSWORD, "view")).not.toBe(computeGateToken(PASSWORD, "upload"))
  })

  it("produces different tokens for different passwords", () => {
    expect(computeGateToken(PASSWORD, "view")).not.toBe(computeGateToken("other-password", "view"))
  })

  it("produces a hex token safe to store in a cookie", () => {
    expect(computeGateToken(PASSWORD, "view")).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe("isGateTokenValid", () => {
  it("accepts the token computed for the same password and audience", () => {
    const token = computeGateToken(PASSWORD, "upload")

    expect(isGateTokenValid(PASSWORD, "upload", token)).toBe(true)
  })

  it("rejects a view token presented to the upload gate", () => {
    const token = computeGateToken(PASSWORD, "view")

    expect(isGateTokenValid(PASSWORD, "upload", token)).toBe(false)
  })

  it("rejects a tampered token", () => {
    const token = computeGateToken(PASSWORD, "view")
    const tampered = (token[0] === "a" ? "b" : "a") + token.slice(1)

    expect(isGateTokenValid(PASSWORD, "view", tampered)).toBe(false)
  })

  it("rejects a token computed with a different password", () => {
    const token = computeGateToken("other-password", "view")

    expect(isGateTokenValid(PASSWORD, "view", token)).toBe(false)
  })

  it("rejects an empty token", () => {
    expect(isGateTokenValid(PASSWORD, "view", "")).toBe(false)
  })

  it("rejects arbitrary garbage of a different length", () => {
    expect(isGateTokenValid(PASSWORD, "view", "nope")).toBe(false)
  })
})

describe("isPasswordMatch", () => {
  it("accepts the exact password", () => {
    expect(isPasswordMatch(PASSWORD, PASSWORD)).toBe(true)
  })

  it("rejects a different password of the same length", () => {
    expect(isPasswordMatch("aaaaaaaa", "aaaaaaab")).toBe(false)
  })

  it("rejects a password of a different length", () => {
    expect(isPasswordMatch(PASSWORD, "short")).toBe(false)
  })

  it("rejects an empty attempt", () => {
    expect(isPasswordMatch(PASSWORD, "")).toBe(false)
  })
})
