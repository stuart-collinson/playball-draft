import {
  leaguePeople,
  participantImageForSlug,
  participantLabelForSlug,
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
