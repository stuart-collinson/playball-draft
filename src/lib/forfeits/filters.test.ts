import { buildForfeitsListInput, readForfeitFilters } from "@pbd/lib/forfeits/filters"
import { describe, expect, it } from "vitest"

describe("buildForfeitsListInput", () => {
  it("sends the cadence and no league for the combined scope", () => {
    expect(buildForfeitsListInput("combined", { cadence: "weekly" })).toEqual({ cadence: "weekly" })
  })

  it("scopes to a single league", () => {
    expect(buildForfeitsListInput("premiership", { cadence: "weekly" })).toEqual({
      cadence: "weekly",
      league: "premiership",
    })
  })

  it("carries the active filters", () => {
    expect(
      buildForfeitsListInput("combined", {
        cadence: "weekly",
        gameweek: "3",
        type: "wildcard",
        subType: "sea-swim",
        person: "stuart-collinson",
      }),
    ).toEqual({
      cadence: "weekly",
      gameweek: "3",
      type: "wildcard",
      subType: "sea-swim",
      person: "stuart-collinson",
    })
  })

  it("only honours a sub-type filter on the wildcard type", () => {
    expect(
      buildForfeitsListInput("combined", { cadence: "weekly", type: "pint", subType: "sea-swim" }),
    ).toEqual({ cadence: "weekly", type: "pint" })
  })

  it("drops a gameweek filter when the cadence is annual", () => {
    expect(buildForfeitsListInput("combined", { cadence: "annual", gameweek: "3" })).toEqual({
      cadence: "annual",
    })
  })

  it("drops a person filter that is not in the selected league", () => {
    expect(
      buildForfeitsListInput("championship", { cadence: "weekly", person: "stuart-collinson" }),
    ).toEqual({ cadence: "weekly", league: "championship" })
  })

  it("keeps a person filter that belongs to the selected league", () => {
    expect(
      buildForfeitsListInput("premiership", { cadence: "weekly", person: "stuart-collinson" }),
    ).toEqual({ cadence: "weekly", league: "premiership", person: "stuart-collinson" })
  })
})

describe("readForfeitFilters", () => {
  it("defaults to the weekly cadence with no filters", () => {
    expect(readForfeitFilters({})).toEqual({
      cadence: "weekly",
      gameweek: null,
      type: null,
      subType: null,
      person: null,
    })
  })

  it("reads every filter from its query parameter", () => {
    expect(
      readForfeitFilters({
        cadence: "annual",
        gw: "3",
        type: "wildcard",
        sub: "sea-swim",
        person: "stuart-collinson",
      }),
    ).toEqual({
      cadence: "annual",
      gameweek: "3",
      type: "wildcard",
      subType: "sea-swim",
      person: "stuart-collinson",
    })
  })

  it("takes the first value of a repeated parameter and ignores empty ones", () => {
    expect(readForfeitFilters({ gw: ["5", "6"], type: "" })).toMatchObject({
      gameweek: "5",
      type: null,
    })
  })

  it("treats any cadence other than annual as weekly", () => {
    expect(readForfeitFilters({ cadence: "monthly" }).cadence).toBe("weekly")
  })
})
