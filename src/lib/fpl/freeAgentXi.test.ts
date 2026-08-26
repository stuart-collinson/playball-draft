import { computeFreeAgentXi } from "@pbd/lib/fpl/freeAgentXi"
import { describe, expect, it } from "vitest"

const candidate = (elementId: number, positionType: number, seasonPoints: number) => ({
  elementId,
  webName: `P${elementId}`,
  teamShort: "T",
  positionType,
  seasonPoints,
})

const squadPool = (counts: { gk: number; def: number; mid: number; fwd: number }, points = 10) => {
  const pool = []
  let id = 1
  for (const [positionType, size] of [
    [1, counts.gk],
    [2, counts.def],
    [3, counts.mid],
    [4, counts.fwd],
  ] as const) {
    for (let i = 0; i < size; i++) pool.push(candidate(id++, positionType, points))
  }
  return pool
}

describe("computeFreeAgentXi", () => {
  it("picks the highest-scoring legal formation", () => {
    const pool = [
      candidate(1, 1, 5),
      candidate(2, 2, 10),
      candidate(3, 2, 10),
      candidate(4, 2, 10),
      candidate(5, 2, 1),
      candidate(6, 3, 20),
      candidate(7, 3, 20),
      candidate(8, 3, 20),
      candidate(9, 3, 20),
      candidate(10, 4, 30),
      candidate(11, 4, 30),
      candidate(12, 4, 30),
    ]

    const xi = computeFreeAgentXi(pool)

    expect(xi?.formation).toBe("3-4-3")
    expect(xi?.totalPoints).toBe(5 + 30 + 80 + 90)
    expect(xi?.players).toHaveLength(11)
  })

  it("returns null when there is no goalkeeper", () => {
    const pool = squadPool({ gk: 0, def: 5, mid: 5, fwd: 3 })

    expect(computeFreeAgentXi(pool)).toBeNull()
  })

  it("skips formations the candidate pool cannot fill", () => {
    const pool = squadPool({ gk: 1, def: 5, mid: 4, fwd: 1 })

    const xi = computeFreeAgentXi(pool)

    expect(xi?.formation).toBe("5-4-1")
  })

  it("returns null when no formation can be filled", () => {
    const pool = squadPool({ gk: 1, def: 2, mid: 5, fwd: 3 })

    expect(computeFreeAgentXi(pool)).toBeNull()
  })
})
