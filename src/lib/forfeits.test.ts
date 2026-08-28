import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import { WHEEL_CHALLENGES } from "@pbd/lib/constants/Wheel"
import {
  forfeitCategory,
  isValidForfeitGameweek,
  isValidForfeitPair,
  resolveForfeitSelection,
} from "@pbd/lib/forfeits"
import { describe, expect, it } from "vitest"

describe("resolveForfeitSelection", () => {
  it("maps a plain weekly forfeit to its type with no sub-type", () => {
    expect(resolveForfeitSelection("pint")).toEqual({ type: "pint", subType: null })
  })

  it("maps a wheel outcome to the wildcard type with the outcome as sub-type", () => {
    expect(resolveForfeitSelection("sea-swim")).toEqual({ type: "wildcard", subType: "sea-swim" })
  })

  it("maps an annual forfeit to its type with no sub-type", () => {
    expect(resolveForfeitSelection("tattoo")).toEqual({ type: "tattoo", subType: null })
  })

  it("rejects the bare wildcard type as a selectable forfeit", () => {
    expect(resolveForfeitSelection("wildcard")).toBeNull()
  })

  it("rejects an unknown selection", () => {
    expect(resolveForfeitSelection("streaking")).toBeNull()
  })
})

describe("isValidForfeitPair", () => {
  it("accepts a plain type with no sub-type", () => {
    expect(isValidForfeitPair("pint", null)).toBe(true)
  })

  it("rejects a plain type carrying a sub-type", () => {
    expect(isValidForfeitPair("pint", "sea-swim")).toBe(false)
  })

  it("accepts wildcard with a wheel outcome sub-type", () => {
    expect(isValidForfeitPair("wildcard", "sea-swim")).toBe(true)
  })

  it("rejects wildcard without a sub-type", () => {
    expect(isValidForfeitPair("wildcard", null)).toBe(false)
  })

  it("rejects wildcard with a sub-type that is not a wheel outcome", () => {
    expect(isValidForfeitPair("wildcard", "pint")).toBe(false)
  })

  it("rejects an unknown type", () => {
    expect(isValidForfeitPair("streaking", null)).toBe(false)
  })
})

describe("forfeitCategory", () => {
  it("classifies pint as weekly", () => {
    expect(forfeitCategory("pint")).toBe("weekly")
  })

  it("classifies wildcard as weekly", () => {
    expect(forfeitCategory("wildcard")).toBe("weekly")
  })

  it("classifies tattoo as annual", () => {
    expect(forfeitCategory("tattoo")).toBe("annual")
  })

  it("returns null for an unknown type", () => {
    expect(forfeitCategory("streaking")).toBeNull()
  })
})

describe("isValidForfeitGameweek", () => {
  it("accepts the first gameweek for a weekly forfeit", () => {
    expect(isValidForfeitGameweek("pint", "1")).toBe(true)
  })

  it("accepts the last gameweek for a weekly forfeit", () => {
    expect(isValidForfeitGameweek("wildcard", "38")).toBe(true)
  })

  it("rejects gameweek zero", () => {
    expect(isValidForfeitGameweek("pint", "0")).toBe(false)
  })

  it("rejects a gameweek past 38", () => {
    expect(isValidForfeitGameweek("pint", "39")).toBe(false)
  })

  it("rejects a zero-padded gameweek", () => {
    expect(isValidForfeitGameweek("pint", "05")).toBe(false)
  })

  it("rejects the annual marker on a weekly forfeit", () => {
    expect(isValidForfeitGameweek("pint", "annual")).toBe(false)
  })

  it("accepts only the annual marker for an annual forfeit", () => {
    expect(isValidForfeitGameweek("tattoo", "annual")).toBe(true)
    expect(isValidForfeitGameweek("tattoo", "12")).toBe(false)
  })

  it("rejects any gameweek for an unknown type", () => {
    expect(isValidForfeitGameweek("streaking", "1")).toBe(false)
  })
})

describe("forfeit taxonomy", () => {
  it("covers every wheel challenge as a wildcard sub-type", () => {
    const labels = WILDCARD_SUB_TYPES.map((subType) => subType.label)
    for (const challenge of WHEEL_CHALLENGES) {
      expect(labels).toContain(challenge)
    }
  })

  it("keeps type and sub-type slugs globally unique", () => {
    const slugs = [
      ...FORFEIT_TYPES.map((type) => type.slug),
      ...WILDCARD_SUB_TYPES.map((subType) => subType.slug),
    ]
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
