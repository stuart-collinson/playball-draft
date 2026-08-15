import { buildLeagueRankMap, buildOverallRankMap } from "@pbd/lib/fpl/ranks"
import type { Standing } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const standing = (league_entry: number, total: number, rank = 0): Standing => ({
  event_total: 0,
  last_rank: 0,
  league_entry,
  rank,
  rank_sort: 0,
  total,
})

describe("buildOverallRankMap", () => {
  it("ranks entries from both leagues by season total, highest first", () => {
    const prem = [standing(1, 100), standing(2, 80)]
    const champ = [standing(3, 90), standing(4, 70)]

    const ranks = buildOverallRankMap(prem, champ)

    expect(ranks.get(1)).toBe(1)
    expect(ranks.get(3)).toBe(2)
    expect(ranks.get(2)).toBe(3)
    expect(ranks.get(4)).toBe(4)
  })

  it("keeps input order for equal totals, premiership first", () => {
    const ranks = buildOverallRankMap([standing(1, 50)], [standing(2, 50)])

    expect(ranks.get(1)).toBe(1)
    expect(ranks.get(2)).toBe(2)
  })

  it("does not mutate the standings arrays it is given", () => {
    const prem = [standing(1, 10), standing(2, 90)]

    buildOverallRankMap(prem, [])

    expect(prem.map((s) => s.league_entry)).toEqual([1, 2])
  })

  it("returns an empty map when neither league has standings", () => {
    expect(buildOverallRankMap([], []).size).toBe(0)
  })
})

describe("buildLeagueRankMap", () => {
  it("keeps each entry's rank within its own league", () => {
    const prem = [standing(1, 100, 1), standing(2, 80, 2)]
    const champ = [standing(3, 90, 1), standing(4, 70, 2)]

    const ranks = buildLeagueRankMap(prem, champ)

    expect(ranks.get(1)).toBe(1)
    expect(ranks.get(2)).toBe(2)
    // Entry 3 tops the championship despite trailing entry 1 overall.
    expect(ranks.get(3)).toBe(1)
    expect(ranks.get(4)).toBe(2)
  })

  it("returns an empty map when neither league has standings", () => {
    expect(buildLeagueRankMap([], []).size).toBe(0)
  })
})
