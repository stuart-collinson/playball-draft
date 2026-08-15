import { hasElapsed, toCountdown } from "@pbd/lib/countdown"
import { describe, expect, it } from "vitest"

const duration = (days: number, hours: number, mins: number, secs: number): number =>
  ((days * 24 + hours) * 3600 + mins * 60 + secs) * 1000

describe("toCountdown", () => {
  it("splits a duration into whole days, hours, minutes and seconds", () => {
    expect(toCountdown(duration(7, 5, 30, 9))).toEqual({
      days: 7,
      hours: 5,
      minutes: 30,
      seconds: 9,
    })
  })

  it("rolls a whole day into the days field rather than 24 hours", () => {
    expect(toCountdown(duration(1, 0, 0, 0))).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })

  it("clamps a past deadline to zero instead of counting upwards", () => {
    expect(toCountdown(-duration(0, 3, 0, 0))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })

  it("floors partial seconds so the display never shows a rounded-up value", () => {
    expect(toCountdown(1900)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 })
  })
})

describe("hasElapsed", () => {
  it("is true only once every unit has reached zero", () => {
    expect(hasElapsed(toCountdown(0))).toBe(true)
    expect(hasElapsed(toCountdown(1000))).toBe(false)
    expect(hasElapsed(toCountdown(duration(0, 0, 0, 1)))).toBe(false)
  })
})
