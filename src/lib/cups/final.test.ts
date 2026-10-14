import { featuredFinalCup, finalLineups } from "@pbd/lib/cups/final"
import type { CupSummary } from "@pbd/types/cups.types"
import { describe, expect, it } from "vitest"

const SEASON = "2026/27"

const LAST_SEASON = "2025/26"

const cup = (
  id: string,
  finalGameweek: number,
  overrides: Partial<CupSummary> = {},
): CupSummary => ({
  id,
  season: SEASON,
  name: `Cup ${id}`,
  format: "knockout",
  schedule: {
    round_of_16: finalGameweek - 3,
    quarter_final: finalGameweek - 2,
    semi_final: finalGameweek - 1,
    final: finalGameweek,
  },
  status: "running",
  currentRound: "final",
  final: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  ...overrides,
})

describe("featuredFinalCup", () => {
  it("features the cup whose final is being played this gameweek", () => {
    const cups = [cup("spring", 35), cup("autumn", 20)]

    const featured = featuredFinalCup(cups, SEASON, 20)

    expect(featured?.id).toBe("autumn")
  })

  it("keeps a final that has just been played over a later cup still in its early rounds", () => {
    const cups = [
      cup("spring", 35, { currentRound: "round_of_16" }),
      cup("autumn", 20, { status: "finished" }),
    ]

    const featured = featuredFinalCup(cups, SEASON, 21)

    expect(featured?.id).toBe("autumn")
  })

  it("features the soonest upcoming final before any final has been played", () => {
    const cups = [cup("spring", 35), cup("autumn", 20, { currentRound: "semi_final" })]

    const featured = featuredFinalCup(cups, SEASON, 19)

    expect(featured?.id).toBe("autumn")
  })

  it("ignores cups from other seasons", () => {
    const cups = [cup("old", 20, { season: LAST_SEASON, status: "finished" }), cup("new", 30)]

    const featured = featuredFinalCup(cups, SEASON, 21)

    expect(featured?.id).toBe("new")
  })

  it("returns null when there are no cups this season", () => {
    const cups = [cup("old", 20, { season: LAST_SEASON, status: "finished" })]

    const featured = featuredFinalCup(cups, SEASON, 21)

    expect(featured).toBeNull()
  })
})

describe("finalLineups", () => {
  it("uses the current teams without points before the final kicks off", () => {
    const lineups = finalLineups(7, 6)

    expect(lineups).toEqual({ gameweek: 6, isConfirmed: false })
  })

  it("uses the final's teams with points during the final's gameweek", () => {
    const lineups = finalLineups(7, 7)

    expect(lineups).toEqual({ gameweek: 7, isConfirmed: true })
  })

  it("keeps the final's teams with points after a later gameweek has started", () => {
    const lineups = finalLineups(7, 9)

    expect(lineups).toEqual({ gameweek: 7, isConfirmed: true })
  })
})
