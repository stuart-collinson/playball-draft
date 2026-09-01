import { computeGateToken } from "@pbd/lib/forfeitsGate"
import { GATE_COOKIE_NAMES } from "@pbd/server/forfeits/gate"
import { createCaller } from "@pbd/server/routers/index"
import { TRPCError } from "@trpc/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const VIEW_PASSWORD = "view-passphrase-for-the-league"
const ADMIN_PASSWORD = "admin-passphrase-for-two-people"

const LUCK_ID = "0b6f2c1e-1111-4222-8333-444455556666"

const VALID_CREATE_INPUT = {
  gameweek: "3",
  people: ["stuart-collinson", "alan-waring"],
  title: "Keeper heads a 94th-minute winner",
  description: "One shot on target all game and it was a goalkeeper's header.",
}

const VALID_UPDATE_INPUT = {
  id: LUCK_ID,
  title: "Jammier than first thought",
  description: "The rebound went in off his back.",
}

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

describe("luck router gate", () => {
  it("serves list with no cookie at all, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.list())).toBe("INTERNAL_SERVER_ERROR")
  })

  it("serves list even when no passwords are configured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.list())).toBe("INTERNAL_SERVER_ERROR")
  })

  it("hides create behind NOT_FOUND when the admin password is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.create(VALID_CREATE_INPUT))).toBe("NOT_FOUND")
  })

  it("rejects create with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects create from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.luck.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects create when the view token is planted in the upload cookie", async () => {
    configure()
    const planted = `${GATE_COOKIE_NAMES.upload}=${computeGateToken(VIEW_PASSWORD, "view")}`
    const caller = callerWithCookie(planted)

    expect(await trpcCode(() => caller.luck.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("lets a valid admin cookie past the create gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.luck.create(VALID_CREATE_INPUT))).toBe(
      "INTERNAL_SERVER_ERROR",
    )
  })

  it("gates create on the admin password alone, without a view password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", ADMIN_PASSWORD)
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.luck.create(VALID_CREATE_INPUT))).toBe(
      "INTERNAL_SERVER_ERROR",
    )
  })

  it("rejects create with a blank description before reaching the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(
      await trpcCode(() => caller.luck.create({ ...VALID_CREATE_INPUT, description: "  " })),
    ).toBe("BAD_REQUEST")
  })

  it("rejects create for an unknown person before reaching the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(
      await trpcCode(() =>
        caller.luck.create({ ...VALID_CREATE_INPUT, people: ["departed-member"] }),
      ),
    ).toBe("BAD_REQUEST")
  })

  it("rejects create with three people before reaching the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(
      await trpcCode(() =>
        caller.luck.create({
          ...VALID_CREATE_INPUT,
          people: ["stuart-collinson", "alan-waring", "lewis-smyth"],
        }),
      ),
    ).toBe("BAD_REQUEST")
  })

  it("rejects create with nobody picked before reaching the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.luck.create({ ...VALID_CREATE_INPUT, people: [] }))).toBe(
      "BAD_REQUEST",
    )
  })

  it("rejects update with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.update(VALID_UPDATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects update from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.luck.update(VALID_UPDATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("hides update behind NOT_FOUND when the admin password is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.update(VALID_UPDATE_INPUT))).toBe("NOT_FOUND")
  })

  it("lets a valid admin cookie past the update gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.luck.update(VALID_UPDATE_INPUT))).toBe(
      "INTERNAL_SERVER_ERROR",
    )
  })

  it("rejects remove with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.remove({ id: LUCK_ID }))).toBe("UNAUTHORIZED")
  })

  it("rejects remove from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.luck.remove({ id: LUCK_ID }))).toBe("UNAUTHORIZED")
  })

  it("hides remove behind NOT_FOUND when the admin password is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.luck.remove({ id: LUCK_ID }))).toBe("NOT_FOUND")
  })

  it("lets a valid admin cookie past the remove gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(adminCookie())

    expect(await trpcCode(() => caller.luck.remove({ id: LUCK_ID }))).toBe("INTERNAL_SERVER_ERROR")
  })
})
