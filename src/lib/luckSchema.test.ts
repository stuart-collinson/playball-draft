import { createLuckInputSchema, updateLuckInputSchema } from "@pbd/lib/luckSchema"
import { describe, expect, it } from "vitest"

const VALID_INPUT = {
  gameweek: "3",
  people: ["stuart-collinson"],
  title: "Keeper heads a 94th-minute winner",
  description: "One shot on target all game and it was a goalkeeper's header.",
}

describe("createLuckInputSchema", () => {
  it("accepts a lucky moment with a single person", () => {
    expect(createLuckInputSchema.safeParse(VALID_INPUT).success).toBe(true)
  })

  it("accepts a cross-league pair of people", () => {
    expect(
      createLuckInputSchema.safeParse({
        ...VALID_INPUT,
        people: ["stuart-collinson", "alan-waring"],
      }).success,
    ).toBe(true)
  })

  it("accepts a same-league pair of people", () => {
    expect(
      createLuckInputSchema.safeParse({
        ...VALID_INPUT,
        people: ["stuart-collinson", "lewis-smyth"],
      }).success,
    ).toBe(true)
  })

  it("rejects an empty people list", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, people: [] }).success).toBe(false)
  })

  it("rejects more than two people", () => {
    expect(
      createLuckInputSchema.safeParse({
        ...VALID_INPUT,
        people: ["stuart-collinson", "alan-waring", "lewis-smyth"],
      }).success,
    ).toBe(false)
  })

  it("rejects the same person twice", () => {
    expect(
      createLuckInputSchema.safeParse({
        ...VALID_INPUT,
        people: ["stuart-collinson", "stuart-collinson"],
      }).success,
    ).toBe(false)
  })

  it("rejects an unknown person", () => {
    expect(
      createLuckInputSchema.safeParse({ ...VALID_INPUT, people: ["departed-member"] }).success,
    ).toBe(false)
  })

  it("accepts the annual marker as the gameweek", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, gameweek: "annual" }).success).toBe(
      true,
    )
  })

  it("accepts the last gameweek", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, gameweek: "38" }).success).toBe(true)
  })

  it("trims the title and description", () => {
    const parsed = createLuckInputSchema.parse({
      ...VALID_INPUT,
      title: "  Jammy  ",
      description: "  So jammy.  ",
    })

    expect(parsed.title).toBe("Jammy")
    expect(parsed.description).toBe("So jammy.")
  })

  it("rejects a blank title", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, title: "   " }).success).toBe(false)
  })

  it("rejects a blank description", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, description: "   " }).success).toBe(
      false,
    )
  })

  it("rejects a title past sixty characters", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, title: "x".repeat(61) }).success).toBe(
      false,
    )
  })

  it("rejects a description past two thousand characters", () => {
    expect(
      createLuckInputSchema.safeParse({ ...VALID_INPUT, description: "x".repeat(2001) }).success,
    ).toBe(false)
  })

  it("rejects gameweek zero", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, gameweek: "0" }).success).toBe(false)
  })

  it("rejects a gameweek past 38", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, gameweek: "39" }).success).toBe(false)
  })

  it("rejects a zero-padded gameweek", () => {
    expect(createLuckInputSchema.safeParse({ ...VALID_INPUT, gameweek: "05" }).success).toBe(false)
  })
})

describe("updateLuckInputSchema", () => {
  const VALID_UPDATE = {
    id: "0b6f2c1e-1111-4222-8333-444455556666",
    title: "Jammier than first thought",
    description: "The rebound went in off his back.",
  }

  it("accepts a valid update", () => {
    expect(updateLuckInputSchema.safeParse(VALID_UPDATE).success).toBe(true)
  })

  it("rejects a malformed id", () => {
    expect(updateLuckInputSchema.safeParse({ ...VALID_UPDATE, id: "not-a-uuid" }).success).toBe(
      false,
    )
  })

  it("rejects a blank description", () => {
    expect(updateLuckInputSchema.safeParse({ ...VALID_UPDATE, description: " " }).success).toBe(
      false,
    )
  })
})
