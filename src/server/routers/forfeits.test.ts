import { computeGateToken } from "@pbd/lib/forfeitsGate"
import { GATE_COOKIE_NAMES } from "@pbd/server/forfeits/gate"
import { createCaller } from "@pbd/server/routers/index"
import { TRPCError } from "@trpc/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const VIEW_PASSWORD = "view-passphrase-for-the-league"
const ADMIN_PASSWORD = "admin-passphrase-for-two-people"

const FORFEIT_ID = "0b6f2c1e-1111-4222-8333-444455556666"

const VALID_UPDATE_INPUT = {
  id: FORFEIT_ID,
  title: "Downed in two",
  description: null,
}

const VALID_CREATE_INPUT = {
  league: "premiership" as const,
  gameweek: "3",
  type: "pint",
  subType: null,
  person: "stuart-collinson",
  title: "Downed in one",
  description: null,
  mediaKind: "video" as const,
  mediaPath: "forfeits/2026-27/gw3/media-abc.mp4",
  thumbPath: "forfeits/2026-27/gw3/thumb-abc.jpg",
  mediaSizeBytes: 8_000_000,
}

const configure = (): void => {
  vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)
  vi.stubEnv("ADMIN_PASSWORD", ADMIN_PASSWORD)
  vi.stubEnv("DATABASE_URL", "")
}

const callerWithCookie = (cookie: string | null) =>
  createCaller({ headers: new Headers(cookie ? { cookie } : {}), user: null })

const viewCookie = (): string =>
  `${GATE_COOKIE_NAMES.view}=${computeGateToken(VIEW_PASSWORD, "view")}`

const uploadCookie = (): string =>
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

describe("forfeits router gate", () => {
  it("hides list behind NOT_FOUND when the feature is unconfigured", async () => {
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.list({}))).toBe("NOT_FOUND")
  })

  it("rejects list with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.list({}))).toBe("UNAUTHORIZED")
  })

  it("rejects detail with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.detail({ id: FORFEIT_ID }))).toBe("UNAUTHORIZED")
  })

  it("rejects create with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects create from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.forfeits.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("lets the admin cookie alone past the view gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(uploadCookie())

    expect(await trpcCode(() => caller.forfeits.list({}))).toBe("INTERNAL_SERVER_ERROR")
  })

  it("rejects create when the view token is planted in the upload cookie", async () => {
    configure()
    const planted = `${GATE_COOKIE_NAMES.upload}=${computeGateToken(VIEW_PASSWORD, "view")}`
    const caller = callerWithCookie(planted)

    expect(await trpcCode(() => caller.forfeits.create(VALID_CREATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("lets a valid view cookie past the gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.forfeits.list({}))).toBe("INTERNAL_SERVER_ERROR")
  })

  it("lets a valid upload cookie past the create gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(uploadCookie())

    expect(await trpcCode(() => caller.forfeits.create(VALID_CREATE_INPUT))).toBe(
      "INTERNAL_SERVER_ERROR",
    )
  })

  it("rejects update with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.update(VALID_UPDATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("rejects update from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.forfeits.update(VALID_UPDATE_INPUT))).toBe("UNAUTHORIZED")
  })

  it("hides update behind NOT_FOUND when the feature is unconfigured", async () => {
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.update(VALID_UPDATE_INPUT))).toBe("NOT_FOUND")
  })

  it("lets a valid admin cookie past the update gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(uploadCookie())

    expect(await trpcCode(() => caller.forfeits.update(VALID_UPDATE_INPUT))).toBe(
      "INTERNAL_SERVER_ERROR",
    )
  })

  it("rejects update with a blank title before reaching the database", async () => {
    configure()
    const caller = callerWithCookie(uploadCookie())

    expect(
      await trpcCode(() => caller.forfeits.update({ ...VALID_UPDATE_INPUT, title: "  " })),
    ).toBe("BAD_REQUEST")
  })

  it("rejects remove with no cookie", async () => {
    configure()
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.remove({ id: FORFEIT_ID }))).toBe("UNAUTHORIZED")
  })

  it("rejects remove from a caller holding only the view cookie", async () => {
    configure()
    const caller = callerWithCookie(viewCookie())

    expect(await trpcCode(() => caller.forfeits.remove({ id: FORFEIT_ID }))).toBe("UNAUTHORIZED")
  })

  it("hides remove behind NOT_FOUND when the feature is unconfigured", async () => {
    const caller = callerWithCookie(null)

    expect(await trpcCode(() => caller.forfeits.remove({ id: FORFEIT_ID }))).toBe("NOT_FOUND")
  })

  it("lets a valid upload cookie past the remove gate, stopping only at the database", async () => {
    configure()
    const caller = callerWithCookie(uploadCookie())

    expect(await trpcCode(() => caller.forfeits.remove({ id: FORFEIT_ID }))).toBe(
      "INTERNAL_SERVER_ERROR",
    )
  })
})
