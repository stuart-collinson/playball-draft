import { computeGateToken } from "@pbd/lib/forfeits/gateTokens"
import { GATE_COOKIE_NAMES } from "@pbd/server/forfeits/gate"
import { createCaller } from "@pbd/server/routers/index"
import { TRPCError } from "@trpc/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const VIEW_PASSWORD = "view-passphrase-for-the-league"
const ADMIN_PASSWORD = "admin-passphrase-for-two-people"

const CUP_ID = "0b6f2c1e-1111-4222-8333-444455556666"

const UNREACHABLE_DATABASE_URL = "postgresql://user:pass@127.0.0.1:9/neondb"

const VALID_CREATE_INPUT = {
  name: "The Playball Cup",
  format: "knockout" as const,
  roundOf16Gameweek: 10,
  quarterFinalGameweek: 11,
  semiFinalGameweek: 12,
  finalGameweek: 13,
}

const VALID_UPDATE_INPUT = { ...VALID_CREATE_INPUT, id: CUP_ID }

const configure = (): void => {
  vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)
  vi.stubEnv("ADMIN_PASSWORD", ADMIN_PASSWORD)
  vi.stubEnv("DATABASE_URL", "")
}

const callerWithCookie = (cookie: string | null) =>
  createCaller({ headers: new Headers(cookie ? { cookie } : {}) })

const viewCookie = (): string =>
  `${GATE_COOKIE_NAMES.view}=${computeGateToken(VIEW_PASSWORD, "view")}`

const adminCookie = (): string =>
  `${GATE_COOKIE_NAMES.upload}=${computeGateToken(ADMIN_PASSWORD, "upload")}`

const trpcCode = async (run: () => Promise<unknown>): Promise<string | null> => {
  try {
    await run()
    return null
  } catch (error) {
    if (error instanceof TRPCError) return error.code
    throw error
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("cups router reads", () => {
  it("hides list behind NOT_FOUND when the database is unconfigured", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.list())).toBe("NOT_FOUND")
  })

  it("serves list with no cookie at all, stopping only at the database", async () => {
    configure()
    vi.stubEnv("DATABASE_URL", UNREACHABLE_DATABASE_URL)
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.list())).toBe("INTERNAL_SERVER_ERROR")
  })

  it("hides detail behind NOT_FOUND when the database is unconfigured", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.detail({ cupId: CUP_ID }))).toBe("NOT_FOUND")
  })

  it("rejects a detail request for something that is not a cup id", async () => {
    configure()
    vi.stubEnv("DATABASE_URL", UNREACHABLE_DATABASE_URL)
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.detail({ cupId: "the-playball-cup" }))).toBe(
      "BAD_REQUEST",
    )
  })
})

describe("cups router admin gate", () => {
  it("rejects the schedule window with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.scheduleWindow())).toBe("UNAUTHORIZED")
  })

  it("hides the schedule window behind NOT_FOUND when the admin password is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.scheduleWindow())).toBe("NOT_FOUND")
  })

  it("rejects create with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects create from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.cups.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects create when the view token is planted in the upload cookie", async () => {
    configure()
    const planted = `${GATE_COOKIE_NAMES.upload}=${computeGateToken(VIEW_PASSWORD, "view")}`
    const caller = callerWithCookie(planted)

    expect(await trpcCode(() => caller.cups.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects update with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.update(VALID_UPDATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects remove with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.remove({ id: CUP_ID }))).toBe("UNAUTHORIZED")
  })

  it("hides remove behind NOT_FOUND when the admin password is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.cups.remove({ id: CUP_ID }))).toBe("NOT_FOUND")
  })

  it("lets a valid admin cookie past the remove gate, stopping only at the database", async () => {
    configure()
    vi.stubEnv("DATABASE_URL", UNREACHABLE_DATABASE_URL)
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.cups.remove({ id: CUP_ID }))).toBe("INTERNAL_SERVER_ERROR")
  })
})

describe("cups router input rules", () => {
  it("rejects a cup whose rounds overlap before anything is drawn", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(
      await trpcCode(() => caller.cups.create({ ...VALID_CREATE_INPUT, semiFinalGameweek: 10 })),
    ).toBe("BAD_REQUEST")
  })

  it("rejects a two-legged cup that leaves no room for a second leg", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(
      await trpcCode(() => caller.cups.create({ ...VALID_CREATE_INPUT, format: "two_legs" })),
    ).toBe("BAD_REQUEST")
  })

  it("rejects a cup with a blank name", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.cups.create({ ...VALID_CREATE_INPUT, name: "   " }))).toBe(
      "BAD_REQUEST",
    )
  })

  it("rejects a final past the end of the season", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(
      await trpcCode(() => caller.cups.create({ ...VALID_CREATE_INPUT, finalGameweek: 39 })),
    ).toBe("BAD_REQUEST")
  })

  it("rejects an update aimed at something that is not a cup id", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.cups.update({ ...VALID_UPDATE_INPUT, id: "cup-1" }))).toBe(
      "BAD_REQUEST",
    )
  })
})
