import { fmtDate } from "@pbd/lib/utils/fmt"
import { describe, expect, it } from "vitest"

describe("fmtDate", () => {
  it("formats an ISO timestamp as day/month/year", () => {
    expect(fmtDate("2026-09-01T18:30:00.000Z")).toBe("01/09/2026")
  })

  it("pins to UK time so a late summer evening rolls into the next day", () => {
    expect(fmtDate("2026-08-31T23:30:00.000Z")).toBe("01/09/2026")
  })

  it("stays on the same day in winter when UK time is UTC", () => {
    expect(fmtDate("2026-12-31T23:30:00.000Z")).toBe("31/12/2026")
  })
})
