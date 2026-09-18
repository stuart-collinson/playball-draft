import {
  cupFeedersLabel,
  cupRoundGameweekLabel,
  cupSpanLabel,
  cupStatusLabel,
} from "@pbd/lib/cups/labels"
import type { CupSchedule } from "@pbd/types/cups.types"
import { describe, expect, it } from "vitest"

const SCHEDULE: CupSchedule = {
  round_of_16: 12,
  quarter_final: 15,
  semi_final: 18,
  final: 21,
}

describe("cupFeedersLabel", () => {
  it("joins the two people who could get here with 'or'", () => {
    expect(cupFeedersLabel(["stuart-collinson", "quinn-tierney"])).toBe("Stu or Quinn")
  })

  it("falls back to a question mark when nobody is known yet", () => {
    expect(cupFeedersLabel([])).toBe("?")
  })

  it("never guesses more than one round ahead", () => {
    expect(cupFeedersLabel(["stuart-collinson", "quinn-tierney"]).split(" or ")).toHaveLength(2)
  })
})

describe("cupRoundGameweekLabel", () => {
  it("names a single game week for a knockout round", () => {
    expect(cupRoundGameweekLabel("knockout", SCHEDULE, "round_of_16")).toBe("GW 12")
  })

  it("names both game weeks for a two-legged round", () => {
    expect(cupRoundGameweekLabel("two_legs", SCHEDULE, "round_of_16")).toBe("GW 12–13")
  })

  it("keeps the final to one game week whatever the format", () => {
    expect(cupRoundGameweekLabel("two_legs", SCHEDULE, "final")).toBe("GW 21")
  })
})

describe("cupSpanLabel", () => {
  it("spans from the first game week to the final", () => {
    expect(cupSpanLabel("knockout", SCHEDULE)).toBe("GW 12–21")
  })
})

describe("cupStatusLabel", () => {
  it("names the round a running cup has reached", () => {
    expect(cupStatusLabel("running", "quarter_final")).toBe("Quarter Finals")
  })

  it("reports a completed cup as finished", () => {
    expect(cupStatusLabel("finished", null)).toBe("Finished")
  })

  it("reports a cup that never reached a final", () => {
    expect(cupStatusLabel("unfinished", null)).toBe("Never finished")
  })
})
