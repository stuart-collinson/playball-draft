import { cupLiveFrom, cupTieView } from "@pbd/lib/cups/live"
import type { CupLive } from "@pbd/lib/cups/live"
import type { CupTie } from "@pbd/types/cups.types"
import { describe, expect, it } from "vitest"

const HOME = "stuart-collinson"

const AWAY = "alan-waring"

const LEWIS_API_ID = 19445

const tie = (overrides: Partial<CupTie> = {}): CupTie => ({
  id: "round_of_16-0",
  round: "round_of_16",
  position: 0,
  personOne: HOME,
  personTwo: AWAY,
  feederOne: [],
  feederTwo: [],
  legs: [{ gameweek: 12, personOne: null, personTwo: null }],
  aggregateOne: null,
  aggregateTwo: null,
  winner: null,
  status: "live",
  ...overrides,
})

const live = (overrides: Partial<CupLive> = {}): CupLive => ({
  gameweek: 12,
  points: { [HOME]: 63, [AWAY]: 35 },
  toPlay: { [HOME]: 3, [AWAY]: 0 },
  ...overrides,
})

describe("cupTieView", () => {
  it("fills a leg in the live gameweek from the live scores", () => {
    const view = cupTieView(tie(), live())

    expect(view.totalOne).toBe(63)
    expect(view.totalTwo).toBe(35)
  })

  it("leaves a settled leg on its stored score", () => {
    const settled = tie({
      legs: [{ gameweek: 12, personOne: 71, personTwo: 44 }],
      status: "settled",
    })

    expect(cupTieView(settled, live()).totalOne).toBe(71)
  })

  it("does not put live scores into a leg from another gameweek", () => {
    const later = tie({ legs: [{ gameweek: 13, personOne: null, personTwo: null }] })

    expect(cupTieView(later, live()).totalOne).toBeNull()
  })

  it("adds a settled first leg to a live second leg", () => {
    const twoLegged = tie({
      legs: [
        { gameweek: 11, personOne: 40, personTwo: 52 },
        { gameweek: 12, personOne: null, personTwo: null },
      ],
    })

    const view = cupTieView(twoLegged, live())

    expect(view.totalOne).toBe(103)
    expect(view.totalTwo).toBe(87)
    expect(view.legsOne).toEqual([40, 63])
  })

  it("shows how many are left to play while the tie is live", () => {
    const view = cupTieView(tie(), live())

    expect(view.toPlayOne).toBe(3)
    expect(view.toPlayTwo).toBe(0)
  })

  it("hides the to-play count once the tie has settled", () => {
    const view = cupTieView(tie({ status: "settled" }), live())

    expect(view.toPlayOne).toBeNull()
  })

  it("hides the to-play count when the live gameweek is not part of the tie", () => {
    const view = cupTieView(tie(), live({ gameweek: 20 }))

    expect(view.toPlayOne).toBeNull()
  })

  it("returns only stored scores when there is nothing live", () => {
    const view = cupTieView(tie({ legs: [{ gameweek: 12, personOne: 55, personTwo: null }] }), null)

    expect(view.totalOne).toBe(55)
    expect(view.totalTwo).toBeNull()
    expect(view.toPlayOne).toBeNull()
  })

  it("leaves a tie with no participants blank", () => {
    const view = cupTieView(tie({ personOne: null, personTwo: null, status: "pending" }), live())

    expect(view.totalOne).toBeNull()
    expect(view.totalTwo).toBeNull()
  })
})

describe("cupLiveFrom", () => {
  it("re-keys fantasy entry ids onto the people slugs the cup uses", () => {
    const converted = cupLiveFrom(12, { [LEWIS_API_ID]: 63 }, { [LEWIS_API_ID]: 2 })

    expect(converted.points["lewis-smyth"]).toBe(63)
    expect(converted.toPlay["lewis-smyth"]).toBe(2)
  })

  it("drops entries that are not one of the sixteen", () => {
    const converted = cupLiveFrom(12, { 999999: 41 }, {})

    expect(Object.keys(converted.points)).toHaveLength(0)
  })
})
