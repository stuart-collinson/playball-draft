import { computeLeagueRecords } from "@pbd/lib/fpl/records"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, rows: [number, number, number][]) => ({
  entryApiId,
  leagueId,
  rows: rows.map(([event, points, pointsOnBench]) => ({ event, points, pointsOnBench })),
})

describe("computeLeagueRecords", () => {
  const league = [
    entry(1, 10, [
      [1, 80, 4],
      [2, 40, 0],
    ]),
    entry(2, 10, [
      [1, 45, 0],
      [2, 39, 12],
    ]),
    entry(3, 10, [
      [1, 30, 0],
      [2, 20, 0],
    ]),
  ]

  it("finds the biggest winning margin with the winner as holder", () => {
    const record = computeLeagueRecords(league).find((r) => r.key === "biggest-margin")

    expect(record?.value).toBe(35)
    expect(record?.holders).toEqual([{ entryApiId: 1, event: 1, points: 80 }])
  })

  it("finds the closest call with the runner-up as holder", () => {
    const record = computeLeagueRecords(league).find((r) => r.key === "closest-call")

    expect(record?.value).toBe(1)
    expect(record?.holders).toEqual([{ entryApiId: 2, event: 2, points: 39 }])
  })

  it("finds the highest combined league week with no named holder", () => {
    const record = computeLeagueRecords(league).find((r) => r.key === "highest-week")

    expect(record?.value).toBe(155)
    expect(record?.holders).toEqual([])
  })

  it("finds the best score that did not win its week", () => {
    const record = computeLeagueRecords(league).find((r) => r.key === "best-non-winner")

    expect(record?.holders).toEqual([{ entryApiId: 2, event: 1, points: 45 }])
  })

  it("finds the lowest winning score", () => {
    const record = computeLeagueRecords(league).find((r) => r.key === "lowest-winner")

    expect(record?.value).toBe(40)
    expect(record?.holders).toEqual([{ entryApiId: 1, event: 2, points: 40 }])
  })

  it("tracks the biggest single-week bench waste", () => {
    const record = computeLeagueRecords(league).find((r) => r.key === "biggest-bench-waste")

    expect(record?.value).toBe(12)
    expect(record?.holders).toEqual([{ entryApiId: 2, event: 2, points: 12 }])
  })

  it("omits the bench record while every bench score is zero", () => {
    const records = computeLeagueRecords([entry(1, 10, [[1, 50, 0]]), entry(2, 10, [[1, 40, 0]])])

    expect(records.find((r) => r.key === "biggest-bench-waste")).toBeUndefined()
  })

  it("lists every holder on a tied record", () => {
    const records = computeLeagueRecords([
      entry(1, 10, [
        [1, 60, 0],
        [2, 50, 0],
      ]),
      entry(2, 10, [
        [1, 40, 0],
        [2, 30, 0],
      ]),
    ])

    const margin = records.find((r) => r.key === "biggest-margin")
    expect(margin?.value).toBe(20)
    expect(margin?.holders).toHaveLength(2)
  })

  it("returns nothing for a league with no finished events", () => {
    expect(computeLeagueRecords([entry(1, 10, [])])).toEqual([])
  })
})
