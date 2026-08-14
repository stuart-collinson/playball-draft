import { PARTICIPANTS } from "@pbd/lib/constants/participants"
import { participantDisplayName } from "@pbd/lib/fpl/participants"
import { describe, expect, it } from "vitest"

describe("participantDisplayName", () => {
  it("prefers the configured nickname", () => {
    const withNickname = PARTICIPANTS.find((p) => p.nickname !== null)
    if (!withNickname) throw new Error("fixture: no participant with a nickname configured")

    expect(participantDisplayName(withNickname.apiId, "FPL Name")).toBe(withNickname.nickname)
  })

  it("falls back to the FPL-reported name for unknown entries", () => {
    expect(participantDisplayName(999999999, "Jane Doe")).toBe("Jane Doe")
  })
})
