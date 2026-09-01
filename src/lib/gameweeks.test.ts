import {
  GAMEWEEK_OPTIONS,
  gameweekLabel,
  isGameweekValue,
  isWeeklyGameweek,
} from "@pbd/lib/gameweeks"
import { describe, expect, it } from "vitest"

describe("isWeeklyGameweek", () => {
  it("accepts the first gameweek", () => {
    expect(isWeeklyGameweek("1")).toBe(true)
  })

  it("accepts the last gameweek", () => {
    expect(isWeeklyGameweek("38")).toBe(true)
  })

  it("rejects gameweek zero", () => {
    expect(isWeeklyGameweek("0")).toBe(false)
  })

  it("rejects a gameweek past 38", () => {
    expect(isWeeklyGameweek("39")).toBe(false)
  })

  it("rejects a zero-padded gameweek", () => {
    expect(isWeeklyGameweek("05")).toBe(false)
  })

  it("rejects the annual marker", () => {
    expect(isWeeklyGameweek("annual")).toBe(false)
  })
})

describe("isGameweekValue", () => {
  it("accepts a weekly gameweek", () => {
    expect(isGameweekValue("12")).toBe(true)
  })

  it("accepts the annual marker", () => {
    expect(isGameweekValue("annual")).toBe(true)
  })

  it("rejects anything else", () => {
    expect(isGameweekValue("cup-final")).toBe(false)
  })
})

describe("gameweekLabel", () => {
  it("labels a weekly gameweek", () => {
    expect(gameweekLabel("7")).toBe("GW 7")
  })

  it("labels the annual marker", () => {
    expect(gameweekLabel("annual")).toBe("Annual")
  })
})

describe("GAMEWEEK_OPTIONS", () => {
  it("offers annual first, then all 38 gameweeks", () => {
    expect(GAMEWEEK_OPTIONS).toHaveLength(39)
    expect(GAMEWEEK_OPTIONS[0]).toEqual({ value: "annual", label: "Annual", fullWidth: true })
    expect(GAMEWEEK_OPTIONS[1]).toEqual({ value: "1", label: "1" })
    expect(GAMEWEEK_OPTIONS[38]).toEqual({ value: "38", label: "38" })
  })
})
