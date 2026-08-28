import { signForfeitMediaUrl } from "@pbd/server/forfeits/media"
import { describe, expect, it, vi } from "vitest"

describe("signForfeitMediaUrl", () => {
  it("refuses to sign a path outside the forfeits folder without touching the blob api", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")

    await expect(signForfeitMediaUrl("participants/lewis_smyth.jpg")).rejects.toThrow()
    expect(fetchSpy).not.toHaveBeenCalled()

    fetchSpy.mockRestore()
  })

  it("refuses a traversal attempt", async () => {
    await expect(signForfeitMediaUrl("forfeits/../secrets/key.txt")).rejects.toThrow()
  })
})
