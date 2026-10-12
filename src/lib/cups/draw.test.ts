import { CUP_ENTRANT_COUNT } from "@pbd/lib/constants/Cups"
import { PARTICIPANTS } from "@pbd/lib/constants/Participants"
import { createDrawSeed, cupEntrants, seededCoinFlip, shuffleWithSeed } from "@pbd/lib/cups/draw"
import { personSlug } from "@pbd/lib/people"
import { describe, expect, it } from "vitest"

const SEED = "a".repeat(64)

const OTHER_SEED = "b".repeat(64)

describe("createDrawSeed", () => {
  it("produces 64 lowercase hex characters", () => {
    const seed = createDrawSeed()

    expect(seed).toMatch(/^[0-9a-f]{64}$/)
  })

  it("does not repeat itself", () => {
    const seeds = new Set(Array.from({ length: 20 }, createDrawSeed))

    expect(seeds.size).toBe(20)
  })
})

describe("cupEntrants", () => {
  it("returns every participant exactly once", () => {
    const entrants = cupEntrants()

    expect(entrants).toHaveLength(CUP_ENTRANT_COUNT)
    expect(new Set(entrants).size).toBe(CUP_ENTRANT_COUNT)
  })

  it("sorts so the input is independent of the participants file order", () => {
    const entrants = cupEntrants()
    const sorted = [...entrants].sort()

    expect(entrants).toEqual(sorted)
  })

  it("uses the same slugs the rest of the app uses for people", () => {
    const entrants = cupEntrants()

    expect(entrants).toContain(personSlug(PARTICIPANTS[0]?.name ?? ""))
  })
})

describe("shuffleWithSeed", () => {
  const entrants = Array.from({ length: CUP_ENTRANT_COUNT }, (_, index) => `person-${index}`)

  it("returns the same order every time for the same seed", () => {
    expect(shuffleWithSeed(entrants, SEED)).toEqual(shuffleWithSeed(entrants, SEED))
  })

  it("returns a different order for a different seed", () => {
    expect(shuffleWithSeed(entrants, SEED)).not.toEqual(shuffleWithSeed(entrants, OTHER_SEED))
  })

  it("keeps every entrant exactly once", () => {
    const shuffled = shuffleWithSeed(entrants, SEED)

    expect(shuffled).toHaveLength(entrants.length)
    expect([...shuffled].sort()).toEqual([...entrants].sort())
  })

  it("leaves the input untouched", () => {
    const original = [...entrants]
    shuffleWithSeed(entrants, SEED)

    expect(entrants).toEqual(original)
  })

  it("puts every entrant in first place across many seeds", () => {
    const firstPlaces = new Set(
      Array.from(
        { length: 400 },
        (_, index) =>
          shuffleWithSeed(
            entrants,
            `${SEED.slice(0, 60)}${index.toString(16).padStart(4, "0")}`,
          )[0],
      ),
    )

    expect(firstPlaces.size).toBe(CUP_ENTRANT_COUNT)
  })
})

describe("seededCoinFlip", () => {
  it("returns the same side every time for the same seed and label", () => {
    expect(seededCoinFlip(SEED, "tie-1")).toBe(seededCoinFlip(SEED, "tie-1"))
  })

  it("only ever returns zero or one", () => {
    const sides = new Set(
      Array.from({ length: 50 }, (_, index) => seededCoinFlip(SEED, `${index}`)),
    )

    expect([...sides].every((side) => side === 0 || side === 1)).toBe(true)
  })

  it("does not always pick the same side", () => {
    const sides = new Set(
      Array.from({ length: 50 }, (_, index) => seededCoinFlip(SEED, `${index}`)),
    )

    expect(sides.size).toBe(2)
  })
})
