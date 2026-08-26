import { computeStandingsHistory } from "@pbd/lib/fpl/standingsHistory"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, totals: [number, number][]) => ({
  entryApiId,
  leagueId,
  totalsByEvent: new Map(totals),
})

describe("computeStandingsHistory", () => {
  it("ranks managers by running total at each gameweek", () => {
    const rows = computeStandingsHistory(
      [
        entry(1, 10, [
          [1, 50],
          [2, 90],
        ]),
        entry(2, 10, [
          [1, 60],
          [2, 80],
        ]),
      ],
      [1, 2],
    )

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first?.history[0]?.position).toBe(2)
    expect(first?.history[1]?.position).toBe(1)
  })

  it("keeps the running total alongside the position", () => {
    const rows = computeStandingsHistory([entry(1, 10, [[1, 64]])], [1])

    expect(rows[0]?.history[0]).toEqual({ event: 1, position: 1, totalPoints: 64 })
  })

  it("ranks each league on its own", () => {
    const rows = computeStandingsHistory([entry(1, 10, [[1, 10]]), entry(2, 20, [[1, 99]])], [1])

    expect(rows.find((r) => r.entryApiId === 1)?.history[0]?.position).toBe(1)
    expect(rows.find((r) => r.entryApiId === 2)?.history[0]?.position).toBe(1)
  })

  it("treats a missing gameweek total as zero points", () => {
    const rows = computeStandingsHistory([entry(1, 10, [[2, 40]]), entry(2, 10, [[1, 30]])], [1, 2])

    expect(rows.find((r) => r.entryApiId === 1)?.history[0]?.totalPoints).toBe(0)
    expect(rows.find((r) => r.entryApiId === 1)?.history[0]?.position).toBe(2)
  })

  it("orders the events even when the finished list arrives unsorted", () => {
    const rows = computeStandingsHistory(
      [
        entry(1, 10, [
          [1, 20],
          [2, 45],
        ]),
      ],
      [2, 1],
    )

    expect(rows[0]?.history.map((point) => point.event)).toEqual([1, 2])
  })

  it("returns empty histories before any gameweek is finished", () => {
    const rows = computeStandingsHistory([entry(1, 10, [])], [])

    expect(rows[0]?.history).toEqual([])
  })
})
