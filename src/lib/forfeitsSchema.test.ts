import { MAX_FORFEIT_MEDIA_BYTES } from "@pbd/lib/constants/Forfeits"
import { createForfeitInputSchema, forfeitWizardSchema } from "@pbd/lib/forfeitsSchema"
import { describe, expect, it } from "vitest"

const validInput = {
  league: "premiership",
  gameweek: "3",
  type: "pint",
  subType: null,
  person: "stuart-collinson",
  title: "Downed in one",
  description: "Straight after the final whistle.",
  mediaKind: "video",
  mediaPath: "forfeits/2026-27/gw3/media-abc.mp4",
  thumbPath: "forfeits/2026-27/gw3/thumb-abc.jpg",
  mediaSizeBytes: 8_000_000,
}

describe("createForfeitInputSchema", () => {
  it("accepts a valid weekly forfeit", () => {
    expect(createForfeitInputSchema.safeParse(validInput).success).toBe(true)
  })

  it("accepts a wildcard forfeit with a wheel outcome", () => {
    const input = { ...validInput, type: "wildcard", subType: "sea-swim" }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(true)
  })

  it("rejects wildcard without a sub-type", () => {
    const input = { ...validInput, type: "wildcard" }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(false)
  })

  it("rejects an annual forfeit pinned to a numeric gameweek", () => {
    const input = { ...validInput, type: "tattoo" }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(false)
  })

  it("accepts an annual forfeit with the annual marker", () => {
    const input = {
      ...validInput,
      type: "tattoo",
      gameweek: "annual",
      mediaPath: "forfeits/2026-27/annual/media-abc.mp4",
      thumbPath: "forfeits/2026-27/annual/thumb-abc.jpg",
    }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(true)
  })

  it("rejects a person who is not in the chosen league", () => {
    const input = { ...validInput, person: "alan-waring" }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(false)
  })

  it("rejects media over the size cap", () => {
    const input = { ...validInput, mediaSizeBytes: MAX_FORFEIT_MEDIA_BYTES + 1 }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(false)
  })

  it("rejects a media path outside the forfeits folder", () => {
    const input = { ...validInput, mediaPath: "participants/lewis_smyth.jpg" }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(false)
  })

  it("rejects an overlong title", () => {
    const input = { ...validInput, title: "x".repeat(61) }

    expect(createForfeitInputSchema.safeParse(input).success).toBe(false)
  })

  it("treats an empty description as absent", () => {
    const parsed = createForfeitInputSchema.parse({ ...validInput, description: "  " })

    expect(parsed.description).toBeNull()
  })
})

describe("forfeitWizardSchema", () => {
  const validDraft = {
    league: "championship",
    person: "alan-waring",
    gameweek: "12",
    selection: "sea-swim",
    title: "Baltic dip",
    description: "",
  }

  it("accepts a complete draft", () => {
    expect(forfeitWizardSchema.safeParse(validDraft).success).toBe(true)
  })

  it("rejects a selection that is not a real forfeit", () => {
    expect(forfeitWizardSchema.safeParse({ ...validDraft, selection: "wildcard" }).success).toBe(
      false,
    )
  })

  it("rejects an annual selection on a numeric gameweek", () => {
    expect(forfeitWizardSchema.safeParse({ ...validDraft, selection: "tattoo" }).success).toBe(
      false,
    )
  })

  it("rejects a person from the other league", () => {
    expect(
      forfeitWizardSchema.safeParse({ ...validDraft, person: "stuart-collinson" }).success,
    ).toBe(false)
  })
})
