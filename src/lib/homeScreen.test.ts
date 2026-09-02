import type { OutcomeEntry } from "@pbd/lib/fpl/gameweekOutcome"
import type { GameweekForfeit } from "@pbd/lib/homeScreen"
import {
  forfeitStatusCopy,
  padGameweek,
  resolveForfeitStatus,
  winnersLine,
} from "@pbd/lib/homeScreen"
import { describe, expect, it } from "vitest"

const person = (overrides: Partial<OutcomeEntry>): OutcomeEntry => ({
  apiId: 1,
  slug: "thomas-campbell",
  name: "Teece",
  points: 40,
  image: null,
  ...overrides,
})

const forfeit = (overrides: Partial<GameweekForfeit>): GameweekForfeit => ({
  id: "11111111-1111-4111-8111-111111111111",
  person: "thomas-campbell",
  league: "premiership" as const,
  title: "Pint",
  ...overrides,
})

describe("padGameweek", () => {
  it("zero-pads single digit gameweeks", () => {
    expect(padGameweek(7)).toBe("07")
  })

  it("leaves double digit gameweeks alone", () => {
    expect(padGameweek(23)).toBe("23")
  })
})

describe("resolveForfeitStatus", () => {
  it("is unknown when the viewer cannot see the forfeit archive", () => {
    expect(resolveForfeitStatus(person({}), "premiership", null)).toEqual({ state: "unknown" })
  })

  it("is unknown when there is no loser to track", () => {
    expect(resolveForfeitStatus(null, "premiership", [forfeit({})])).toEqual({ state: "unknown" })
  })

  it("links the uploaded forfeit when the loser has filed this gameweek", () => {
    const status = resolveForfeitStatus(person({}), "premiership", [
      forfeit({ league: "championship", person: "thomas-campbell" }),
      forfeit({ id: "22222222-2222-4222-8222-222222222222", title: "TikTok Dance" }),
    ])

    expect(status).toEqual({
      state: "complete",
      title: "TikTok Dance",
      href: "/forfeits/premiership/22222222-2222-4222-8222-222222222222",
    })
  })

  it("is pending when nothing matches the loser in their league", () => {
    const status = resolveForfeitStatus(person({}), "premiership", [
      forfeit({ person: "peter-baker" }),
    ])

    expect(status).toEqual({ state: "pending" })
  })
})

describe("forfeitStatusCopy", () => {
  it("describes an unknown status without a link", () => {
    expect(forfeitStatusCopy({ state: "unknown" })).toEqual({
      headline: "Forfeit due",
      detail: "Unlock forfeits to track",
      href: null,
    })
  })

  it("describes a pending status without a link", () => {
    expect(forfeitStatusCopy({ state: "pending" })).toEqual({
      headline: "Forfeit pending",
      detail: "Awaiting evidence",
      href: null,
    })
  })

  it("uses the forfeit title and link once evidence is filed", () => {
    expect(
      forfeitStatusCopy({ state: "complete", title: "Pint", href: "/forfeits/premiership/abc" }),
    ).toEqual({ headline: "Pint", detail: "Evidence filed", href: "/forfeits/premiership/abc" })
  })
})

describe("winnersLine", () => {
  it("joins both winners with their points", () => {
    const line = winnersLine(
      { winner: person({ name: "Pete", points: 71 }), loser: null, total: 0 },
      { winner: person({ name: "Jam", points: 75 }), loser: null, total: 0 },
    )

    expect(line).toBe("Pete 71 · Jam 75")
  })

  it("falls back to TBC for a league without a winner", () => {
    const line = winnersLine(
      { winner: null, loser: null, total: 0 },
      { winner: person({ name: "Jam", points: 75 }), loser: null, total: 0 },
    )

    expect(line).toBe("TBC · Jam 75")
  })
})
