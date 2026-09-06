import { createCaller } from "@pbd/server/routers/index"
import { TRPCError } from "@trpc/server"
import { afterEach, describe, expect, it, vi } from "vitest"

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

describe("survival router", () => {
  it("hides the list behind NOT_FOUND when the database is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const caller = createCaller({ headers: new Headers() })

    expect(await trpcCode(() => caller.survival.list())).toBe("NOT_FOUND")
  })
})
