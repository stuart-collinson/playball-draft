import { countGameweeksPlayed } from "@pbd/lib/fpl/gameweeks"
import { describe, expect, it } from "vitest"

describe("countGameweeksPlayed", () => {
  it("counts the current gameweek as played", () => {
    expect(countGameweeksPlayed(5, 1)).toBe(5)
  })

  it("offsets by a league that joins the season late", () => {
    expect(countGameweeksPlayed(10, 4)).toBe(7)
  })

  it("returns zero before the season starts", () => {
    expect(countGameweeksPlayed(null, 1)).toBe(0)
  })

  it("returns zero when the league starts after the current gameweek", () => {
    expect(countGameweeksPlayed(2, 6)).toBe(0)
  })
})
