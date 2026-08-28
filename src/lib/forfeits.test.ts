import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import { WHEEL_CHALLENGES } from "@pbd/lib/constants/Wheel"
import {
  buildForfeitsListInput,
  forfeitCategory,
  forfeitDefaultTitle,
  forfeitDisplayLabel,
  forfeitPeople,
  isValidForfeitGameweek,
  isValidForfeitPair,
  isWildcardSubTypeSlug,
  participantLabelForSlug,
  personSlug,
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

describe("isWildcardSubTypeSlug", () => {
  it("recognises every wheel outcome as a wildcard sub-type", () => {
    for (const outcome of WILDCARD_SUB_TYPES) expect(isWildcardSubTypeSlug(outcome.slug)).toBe(true)
  })

  it("rejects the wildcard type itself", () => {
    expect(isWildcardSubTypeSlug("wildcard")).toBe(false)
  })

  it("rejects a plain forfeit type", () => {
    expect(isWildcardSubTypeSlug("pint")).toBe(false)
  })

  it("rejects an unknown slug", () => {
    expect(isWildcardSubTypeSlug("streaking")).toBe(false)
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

describe("personSlug", () => {
  it("kebab-cases a participant name", () => {
    expect(personSlug("Stuart Collinson")).toBe("stuart-collinson")
  })

  it("strips characters that do not belong in a slug", () => {
    expect(personSlug("Tony  O'Brien Jr.")).toBe("tony-obrien-jr")
  })
})

describe("forfeitPeople", () => {
  it("lists all sixteen members for the combined scope", () => {
    expect(forfeitPeople("combined")).toHaveLength(16)
  })

  it("narrows to the eight premiership members", () => {
    const slugs = forfeitPeople("premiership").map((person) => person.slug)

    expect(slugs).toHaveLength(8)
    expect(slugs).toContain("stuart-collinson")
    expect(slugs).not.toContain("alan-waring")
  })

  it("labels people by nickname when one exists", () => {
    const stuart = forfeitPeople("premiership").find((person) => person.slug === "stuart-collinson")

    expect(stuart?.label).toBe("Stu")
  })
})

describe("participantLabelForSlug", () => {
  it("resolves a known slug to the nickname", () => {
    expect(participantLabelForSlug("stuart-collinson")).toBe("Stu")
  })

  it("falls back to the slug for an unknown person", () => {
    expect(participantLabelForSlug("departed-member")).toBe("departed-member")
  })
})

describe("forfeitDisplayLabel", () => {
  it("labels a plain forfeit by its type", () => {
    expect(forfeitDisplayLabel("pint", null)).toBe("Pint")
  })

  it("labels a wildcard forfeit with its wheel outcome", () => {
    expect(forfeitDisplayLabel("wildcard", "sea-swim")).toBe("Wildcard · Sea Swim")
  })

  it("falls back to the raw slug for an unknown type", () => {
    expect(forfeitDisplayLabel("streaking", null)).toBe("streaking")
  })
})

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

describe("forfeitDefaultTitle", () => {
  it("returns the default title for a plain weekly forfeit", () => {
    expect(forfeitDefaultTitle("pint")).toBe("Pint")
  })

  it("returns the wheel outcome's default title", () => {
    expect(forfeitDefaultTitle("1km-run")).toBe("1km PB Attempt")
    expect(forfeitDefaultTitle("goal-celebration")).toBe("Goal & Celebration")
  })

  it("returns the default title for an annual forfeit", () => {
    expect(forfeitDefaultTitle("24-hours-pub")).toBe("24 Hours in a Pub")
  })

  it("returns an empty string for an unknown selection", () => {
    expect(forfeitDefaultTitle("streaking")).toBe("")
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
