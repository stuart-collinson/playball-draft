import { computeGateToken } from "@pbd/lib/forfeitsGate"
import {
  GATE_COOKIE_NAMES,
  buildGateSetCookie,
  hasGateAccess,
  isForfeitsConfigured,
  requireGateAccess,
  verifyGatePassword,
} from "@pbd/server/forfeits/gate"
import { TRPCError } from "@trpc/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const VIEW_PASSWORD = "view-passphrase-for-the-league"
const UPLOAD_PASSWORD = "upload-passphrase-for-two-people"

const configure = (): void => {
  vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)
  vi.stubEnv("FORFEITS_UPLOAD_PASSWORD", UPLOAD_PASSWORD)
}

const headersWithCookie = (cookie: string): Headers => new Headers({ cookie })

const trpcCode = (run: () => void): string | null => {
  try {
    run()
    return null
  } catch (error) {
    if (error instanceof TRPCError) return error.code
    throw error
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("isForfeitsConfigured", () => {
  it("is configured when both passwords are set and long enough", () => {
    configure()

    expect(isForfeitsConfigured()).toBe(true)
  })

  it("is not configured when the view password is missing", () => {
    vi.stubEnv("FORFEITS_UPLOAD_PASSWORD", UPLOAD_PASSWORD)

    expect(isForfeitsConfigured()).toBe(false)
  })

  it("is not configured when the upload password is missing", () => {
    vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)

    expect(isForfeitsConfigured()).toBe(false)
  })

  it("is not configured when a password is below the minimum length", () => {
    vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)
    vi.stubEnv("FORFEITS_UPLOAD_PASSWORD", "elevenchars")

    expect(isForfeitsConfigured()).toBe(false)
  })
})

describe("verifyGatePassword", () => {
  it("accepts the correct password for its audience", () => {
    configure()

    expect(verifyGatePassword("view", VIEW_PASSWORD)).toBe(true)
  })

  it("rejects a wrong password", () => {
    configure()

    expect(verifyGatePassword("view", "not-the-password")).toBe(false)
  })

  it("rejects the view password at the upload gate", () => {
    configure()

    expect(verifyGatePassword("upload", VIEW_PASSWORD)).toBe(false)
  })

  it("fails closed when the configured password is too short, even on an exact match", () => {
    vi.stubEnv("FORFEITS_VIEW_PASSWORD", "tiny")
    vi.stubEnv("FORFEITS_UPLOAD_PASSWORD", UPLOAD_PASSWORD)

    expect(verifyGatePassword("view", "tiny")).toBe(false)
  })
})

describe("hasGateAccess", () => {
  it("denies access with no cookie header", () => {
    configure()

    expect(hasGateAccess("view", new Headers())).toBe(false)
  })

  it("grants access with a valid cookie among other cookies", () => {
    configure()
    const token = computeGateToken(VIEW_PASSWORD, "view")

    expect(
      hasGateAccess(
        "view",
        headersWithCookie(`theme=dark; ${GATE_COOKIE_NAMES.view}=${token}; other=1`),
      ),
    ).toBe(true)
  })

  it("denies access with a tampered cookie", () => {
    configure()
    const token = computeGateToken(VIEW_PASSWORD, "view")
    const tampered = (token[0] === "a" ? "b" : "a") + token.slice(1)

    expect(hasGateAccess("view", headersWithCookie(`${GATE_COOKIE_NAMES.view}=${tampered}`))).toBe(
      false,
    )
  })

  it("denies upload access when the view token is planted in the upload cookie", () => {
    configure()
    const viewToken = computeGateToken(VIEW_PASSWORD, "view")

    expect(
      hasGateAccess("upload", headersWithCookie(`${GATE_COOKIE_NAMES.upload}=${viewToken}`)),
    ).toBe(false)
  })

  it("denies access when unconfigured even with a previously valid cookie", () => {
    configure()
    const token = computeGateToken(VIEW_PASSWORD, "view")
    vi.unstubAllEnvs()

    expect(hasGateAccess("view", headersWithCookie(`${GATE_COOKIE_NAMES.view}=${token}`))).toBe(
      false,
    )
  })
})

describe("requireGateAccess", () => {
  it("throws NOT_FOUND when the feature is unconfigured", () => {
    expect(trpcCode(() => requireGateAccess("view", new Headers()))).toBe("NOT_FOUND")
  })

  it("throws UNAUTHORIZED without a valid cookie when configured", () => {
    configure()

    expect(trpcCode(() => requireGateAccess("upload", new Headers()))).toBe("UNAUTHORIZED")
  })

  it("passes with a valid cookie", () => {
    configure()
    const token = computeGateToken(UPLOAD_PASSWORD, "upload")
    const headers = headersWithCookie(`${GATE_COOKIE_NAMES.upload}=${token}`)

    expect(trpcCode(() => requireGateAccess("upload", headers))).toBeNull()
  })
})

describe("buildGateSetCookie", () => {
  it("returns null when unconfigured", () => {
    expect(buildGateSetCookie("view")).toBeNull()
  })

  it("sets an httpOnly lax cookie scoped to the site", () => {
    configure()
    const token = computeGateToken(VIEW_PASSWORD, "view")

    const cookie = buildGateSetCookie("view")

    expect(cookie).toContain(`${GATE_COOKIE_NAMES.view}=${token}`)
    expect(cookie).toContain("HttpOnly")
    expect(cookie).toContain("SameSite=Lax")
    expect(cookie).toContain("Path=/")
    expect(cookie).toContain("Max-Age=")
    expect(cookie).not.toContain("Secure")
  })

  it("marks the cookie Secure in production", () => {
    configure()
    vi.stubEnv("NODE_ENV", "production")

    expect(buildGateSetCookie("view")).toContain("Secure")
  })
})
