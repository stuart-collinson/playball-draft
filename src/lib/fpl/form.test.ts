import { computeFormTable } from "@pbd/lib/fpl/form"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, points: number[]) => ({
  entryApiId,
  leagueId,
  rows: points.map((p, i) => ({ event: i + 1, points: p })),
})

describe("computeFormTable", () => {
  it("only counts the last few gameweeks", () => {
    const rows = computeFormTable([entry(1, 10, [99, 99, 10, 20]), entry(2, 10, [1, 1, 30, 40])], 2)

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first?.formPoints).toBe(30)
    expect(first?.played).toBe(2)
  })

  it("builds the win record from only those recent weeks", () => {
    const rows = computeFormTable([entry(1, 10, [99, 10]), entry(2, 10, [1, 20])], 1)

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, losses: 1 })
    expect(rows.find((r) => r.entryApiId === 2)).toMatchObject({ wins: 1, losses: 0 })
  })

  it("averages over the weeks actually inside the window", () => {
    const rows = computeFormTable([entry(1, 10, [40, 60]), entry(2, 10, [10, 10])], 6)

    expect(rows.find((r) => r.entryApiId === 1)?.formAvg).toBe(50)
  })

  it("uses every gameweek when fewer have been played than the window", () => {
    const rows = computeFormTable([entry(1, 10, [45]), entry(2, 10, [30])], 6)

    expect(rows.find((r) => r.entryApiId === 1)?.played).toBe(1)
  })

  it("takes the latest weeks even when the rows arrive out of order", () => {
    const rows = computeFormTable(
      [
        {
          entryApiId: 1,
          leagueId: 10,
          rows: [
            { event: 3, points: 70 },
            { event: 1, points: 5 },
          ],
        },
        {
          entryApiId: 2,
          leagueId: 10,
          rows: [
            { event: 1, points: 5 },
            { event: 3, points: 10 },
          ],
        },
      ],
      1,
    )

    expect(rows.find((r) => r.entryApiId === 1)?.formPoints).toBe(70)
  })

  it("keeps a manager with no finished weeks on zero", () => {
    const rows = computeFormTable([entry(1, 10, []), entry(2, 10, [])], 6)

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({
      formPoints: 0,
      formAvg: 0,
      played: 0,
    })
  })
})
