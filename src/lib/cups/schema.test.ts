import { createCupInputSchema, updateCupInputSchema } from "@pbd/lib/cups/schema"
import { describe, expect, it } from "vitest"

const VALID_KNOCKOUT = {
  name: "The Playball Cup",
  format: "knockout" as const,
  roundOf16Gameweek: 10,
  quarterFinalGameweek: 11,
  semiFinalGameweek: 12,
  finalGameweek: 13,
}

const VALID_TWO_LEGS = {
  ...VALID_KNOCKOUT,
  format: "two_legs" as const,
  quarterFinalGameweek: 12,
  semiFinalGameweek: 14,
  finalGameweek: 16,
}

const CUP_ID = "6f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d"

describe("createCupInputSchema", () => {
  it("accepts a knockout running week after week", () => {
    expect(createCupInputSchema.safeParse(VALID_KNOCKOUT).success).toBe(true)
  })

  it("accepts a two-legged cup with room for every second leg", () => {
    expect(createCupInputSchema.safeParse(VALID_TWO_LEGS).success).toBe(true)
  })

  it("accepts long gaps between rounds", () => {
    expect(
      createCupInputSchema.safeParse({
        ...VALID_KNOCKOUT,
        quarterFinalGameweek: 20,
        semiFinalGameweek: 30,
        finalGameweek: 38,
      }).success,
    ).toBe(true)
  })

  it("rejects a blank name", () => {
    expect(createCupInputSchema.safeParse({ ...VALID_KNOCKOUT, name: "   " }).success).toBe(false)
  })

  it("rejects rounds that run backwards", () => {
    expect(
      createCupInputSchema.safeParse({ ...VALID_KNOCKOUT, semiFinalGameweek: 10 }).success,
    ).toBe(false)
  })

  it("rejects a two-legged round landing on the previous round's second leg", () => {
    expect(
      createCupInputSchema.safeParse({ ...VALID_TWO_LEGS, quarterFinalGameweek: 11 }).success,
    ).toBe(false)
  })

  it("rejects a final past the end of the season", () => {
    expect(createCupInputSchema.safeParse({ ...VALID_KNOCKOUT, finalGameweek: 39 }).success).toBe(
      false,
    )
  })

  it("rejects an unknown format", () => {
    expect(createCupInputSchema.safeParse({ ...VALID_KNOCKOUT, format: "league" }).success).toBe(
      false,
    )
  })
})

describe("updateCupInputSchema", () => {
  it("accepts a rename alongside a legal schedule", () => {
    expect(updateCupInputSchema.safeParse({ ...VALID_KNOCKOUT, id: CUP_ID }).success).toBe(true)
  })

  it("rejects an id that is not a uuid", () => {
    expect(updateCupInputSchema.safeParse({ ...VALID_KNOCKOUT, id: "cup-1" }).success).toBe(false)
  })
})
