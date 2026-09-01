import {
  leaguePeople,
  participantImageForSlug,
  participantLabelForSlug,
  participantLeagueForSlug,
  peopleLabel,
  peopleLeaguesLabel,
  personSlug,
} from "@pbd/lib/people"
import { describe, expect, it } from "vitest"

describe("personSlug", () => {
  it("kebab-cases a participant name", () => {
    expect(personSlug("Stuart Collinson")).toBe("stuart-collinson")
  })

  it("strips characters that do not belong in a slug", () => {
    expect(personSlug("Tony  O'Brien Jr.")).toBe("tony-obrien-jr")
  })
})

describe("leaguePeople", () => {
  it("lists all sixteen members for the combined scope", () => {
    expect(leaguePeople("combined")).toHaveLength(16)
  })

  it("narrows to the eight premiership members", () => {
    const slugs = leaguePeople("premiership").map((person) => person.slug)

    expect(slugs).toHaveLength(8)
    expect(slugs).toContain("stuart-collinson")
    expect(slugs).not.toContain("alan-waring")
  })

  it("labels people by nickname when one exists", () => {
    const stuart = leaguePeople("premiership").find((person) => person.slug === "stuart-collinson")

    expect(stuart?.label).toBe("Stu")
  })

  it("carries each person's league", () => {
    const people = leaguePeople("combined")

    expect(people.find((person) => person.slug === "stuart-collinson")?.league).toBe("premiership")
    expect(people.find((person) => person.slug === "alan-waring")?.league).toBe("championship")
  })
})

describe("participantLeagueForSlug", () => {
  it("resolves a premiership member", () => {
    expect(participantLeagueForSlug("stuart-collinson")).toBe("premiership")
  })

  it("resolves a championship member", () => {
    expect(participantLeagueForSlug("alan-waring")).toBe("championship")
  })

  it("returns null for an unknown person", () => {
    expect(participantLeagueForSlug("departed-member")).toBeNull()
  })
})

describe("peopleLabel", () => {
  it("labels a single person", () => {
    expect(peopleLabel(["stuart-collinson"])).toBe("Stu")
  })

  it("joins a pair with an ampersand", () => {
    expect(peopleLabel(["stuart-collinson", "departed-member"])).toBe("Stu & departed-member")
  })
})

describe("peopleLeaguesLabel", () => {
  it("labels a single person's league", () => {
    expect(peopleLeaguesLabel(["stuart-collinson"])).toBe("Premiership")
  })

  it("joins a cross-league pair", () => {
    expect(peopleLeaguesLabel(["stuart-collinson", "alan-waring"])).toBe(
      "Premiership · Championship",
    )
  })

  it("collapses a same-league pair to one label", () => {
    const premiership = leaguePeople("premiership").map((person) => person.slug)

    expect(peopleLeaguesLabel([premiership[0] ?? "", premiership[1] ?? ""])).toBe("Premiership")
  })

  it("returns an empty string when nobody is recognisable", () => {
    expect(peopleLeaguesLabel(["departed-member"])).toBe("")
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

describe("participantImageForSlug", () => {
  it("resolves a known slug to their photo path", () => {
    expect(participantImageForSlug("stuart-collinson")).toBe("/participants/stuart_collinson.jpg")
  })

  it("returns null for an unknown person", () => {
    expect(participantImageForSlug("departed-member")).toBeNull()
  })
})
