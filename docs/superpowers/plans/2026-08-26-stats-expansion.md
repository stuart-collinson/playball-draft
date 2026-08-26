# Stats Library Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the Extra → Stats library from 11 to 35 stats using only FPL Draft API data the app already fetches, with grouped tiles on the Extra page and an enriched squad view.

**Architecture:** Pure derivation functions in `src/lib/fpl/` (TDD, client-safe) fed by one shared server assembler (`fetchSeasonScores`) that composes existing cached fetches; thin tRPC procedures in three new router files; one-line suspense hooks over `fpl.cache.ts` options; a shared `ManagerStatList` renderer for every manager-ranked view; `Record<StatSlug, …>` exhaustiveness drives wiring.

**Tech Stack:** Next.js 15 App Router, tRPC v11 + TanStack Query (suspense), Zod, Tailwind v4, recharts, vitest.

**Spec:** `docs/superpowers/specs/2026-08-26-stats-expansion-design.md`

## Deviations discovered during execution

- **Vs The World was cut.** The draft API ships `average_entry_score` on every event
  but the value is always `null` — the draft game has no global average, and the
  classic game's average is not comparable (captain doubling). The slug, view, hook,
  options, procedure, and the assembler's `averageByEvent` field were removed rather
  than shipping a permanently empty tile. Wave 1 lands 13 new slugs, not 14; the
  library target becomes 34, not 35.

## Global Constraints

- **No code comments of any kind** (repo CLAUDE.md). No JSDoc, no inline notes, no TODOs.
- **No Claude/Anthropic attribution** in commits, ever. Conventional commit style: `feat: …`, `refactor: …`, `test: …`.
- Biome style: double quotes, no semicolons, trailing commas, 100-char lines, `arrowParentheses: always`. `noExplicitAny` is an error.
- `noUncheckedIndexedAccess` is on — guard every indexed access (`arr[0]` is `T | undefined`).
- Arrow functions only; explicit return types on exported functions; `type` not `interface`.
- Import alias `@pbd/*` for everything under `src/`.
- Test commands: all = `pnpm test`; single file = `pnpm test src/lib/fpl/allPlay.test.ts`. Also `pnpm typecheck`, `pnpm check` (biome), `pnpm build`.
- Only finished events count (`bootstrap.events.data[].finished`), matching existing procedures.
- Within-league maths for all-play/luck/form/streaks/records/rivalry; merged rows for combined scope (precedent: `gwCountsTable` keys by `${leagueId}-${event}`).
- Manager naming fallback chain everywhere: `PARTICIPANT_BY_API_ID[id]?.nickname ?? PARTICIPANT_BY_API_ID[id]?.name ?? "First Last"`.

---

### Task 1: History field types + all-play lib

**Files:**
- Modify: `src/types/fpl.types.ts` (EntryHistoryEvent, FplElement)
- Create: `src/lib/fpl/allPlay.ts`
- Test: `src/lib/fpl/allPlay.test.ts`

**Interfaces:**
- Produces: `AllPlayEntryInput`, `AllPlayTableRow`, `computeAllPlayTable(entries)`, `PairwiseCell`, `PairwiseGrid`, `computePairwiseGrids(entries)`, `RivalExtreme`, `computeRivalExtremes(grid)`. `SeasonEntry` (Task 5) is structurally assignable to `AllPlayEntryInput`.
- `luckDelta = allPlayRank − actualRank` (positive = the total-points table flatters you).

- [ ] **Step 1: Extend types**

In `src/types/fpl.types.ts` add to `EntryHistoryEvent`:

```ts
  points_on_bench: number
  event_transfers: number
```

Add to `FplElement` (after `total_points`):

```ts
  draft_rank: number
```

- [ ] **Step 2: Write failing tests**

`src/lib/fpl/allPlay.test.ts`:

```ts
import {
  computeAllPlayTable,
  computePairwiseGrids,
  computeRivalExtremes,
} from "@pbd/lib/fpl/allPlay"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, points: number[]) => ({
  entryApiId,
  leagueId,
  rows: points.map((p, i) => ({ event: i + 1, points: p })),
})

describe("computeAllPlayTable", () => {
  it("credits a win per opponent outscored each event", () => {
    const rows = computeAllPlayTable([
      entry(1, 10, [60, 40]),
      entry(2, 10, [50, 50]),
      entry(3, 10, [40, 60]),
    ])

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first).toMatchObject({ wins: 3, draws: 0, losses: 1 })
  })

  it("scores identical points as a draw for both sides", () => {
    const rows = computeAllPlayTable([entry(1, 10, [50]), entry(2, 10, [50])])

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, draws: 1, losses: 0 })
    expect(rows.find((r) => r.entryApiId === 2)).toMatchObject({ wins: 0, draws: 1, losses: 0 })
  })

  it("never compares entries across leagues", () => {
    const rows = computeAllPlayTable([entry(1, 10, [60]), entry(2, 99, [10])])

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, draws: 0, losses: 0 })
  })

  it("reports positive luck when table rank beats all-play rank", () => {
    const rows = computeAllPlayTable([
      entry(1, 10, [140, 10, 10]),
      entry(2, 10, [50, 50, 50]),
      entry(3, 10, [45, 45, 45]),
      entry(4, 10, [40, 40, 40]),
    ])

    const boomBust = rows.find((r) => r.entryApiId === 1)
    expect(boomBust?.actualRank).toBe(1)
    expect(boomBust?.allPlayRank).toBe(3)
    expect(boomBust?.luckDelta).toBe(2)
  })

  it("computes winPct as wins plus half draws over games played", () => {
    const rows = computeAllPlayTable([entry(1, 10, [50, 60]), entry(2, 10, [50, 40])])

    expect(rows.find((r) => r.entryApiId === 1)?.winPct).toBe(75)
  })

  it("returns zeroed records when no events are played", () => {
    const rows = computeAllPlayTable([entry(1, 10, []), entry(2, 10, [])])

    expect(rows.find((r) => r.entryApiId === 1)).toMatchObject({ wins: 0, winPct: 0 })
  })
})

describe("computePairwiseGrids", () => {
  it("builds a per-league matrix aligned to a dominance-sorted order", () => {
    const grids = computePairwiseGrids([
      entry(1, 10, [60, 60]),
      entry(2, 10, [50, 50]),
      entry(3, 10, [40, 55]),
    ])

    const grid = grids.find((g) => g.leagueId === 10)
    expect(grid?.order[0]).toBe(1)
    const topRow = grid?.cells[0]
    expect(topRow?.[1]).toMatchObject({ wins: 2, losses: 0 })
    expect(topRow?.[0]).toMatchObject({ wins: 0, draws: 0, losses: 0 })
  })
})

describe("computeRivalExtremes", () => {
  it("finds the nemesis with the worst net record and the bunny with the best", () => {
    const grids = computePairwiseGrids([
      entry(1, 10, [60, 10, 60]),
      entry(2, 10, [50, 50, 50]),
      entry(3, 10, [70, 5, 5]),
    ])
    const grid = grids.find((g) => g.leagueId === 10)
    if (!grid) throw new Error("missing grid")

    const extremes = computeRivalExtremes(grid)

    const forTwo = extremes.find((e) => e.entryApiId === 2)
    expect(forTwo?.nemesisApiId).toBe(1)
    expect(forTwo?.bunnyApiId).toBe(3)
  })
})
```

- [ ] **Step 3: Run tests, expect module-not-found failure**

Run: `pnpm test src/lib/fpl/allPlay.test.ts` — expect FAIL (cannot resolve `@pbd/lib/fpl/allPlay`).

- [ ] **Step 4: Implement `src/lib/fpl/allPlay.ts`**

```ts
import { round1 } from "@pbd/lib/utils/fmt"

export type AllPlayEntryInput = {
  entryApiId: number
  leagueId: number
  rows: { event: number; points: number }[]
}

export type AllPlayTableRow = {
  entryApiId: number
  leagueId: number
  wins: number
  draws: number
  losses: number
  winPct: number
  totalPoints: number
  actualRank: number
  allPlayRank: number
  luckDelta: number
}

export type PairwiseCell = { wins: number; draws: number; losses: number }

export type PairwiseGrid = {
  leagueId: number
  order: number[]
  cells: PairwiseCell[][]
}

export type RivalExtreme = {
  entryApiId: number
  nemesisApiId: number | null
  nemesisRecord: PairwiseCell | null
  bunnyApiId: number | null
  bunnyRecord: PairwiseCell | null
}

type Tally = { wins: number; draws: number; losses: number }

const HALF_WIN = 0.5
const PCT = 100

const groupByLeague = (entries: AllPlayEntryInput[]): Map<number, AllPlayEntryInput[]> => {
  const byLeague = new Map<number, AllPlayEntryInput[]>()
  for (const entry of entries) {
    const group = byLeague.get(entry.leagueId) ?? []
    group.push(entry)
    byLeague.set(entry.leagueId, group)
  }
  return byLeague
}

const eventScores = (
  group: AllPlayEntryInput[],
): Map<number, { entryApiId: number; points: number }[]> => {
  const byEvent = new Map<number, { entryApiId: number; points: number }[]>()
  for (const entry of group) {
    for (const row of entry.rows) {
      const scores = byEvent.get(row.event) ?? []
      scores.push({ entryApiId: entry.entryApiId, points: row.points })
      byEvent.set(row.event, scores)
    }
  }
  return byEvent
}

export const computeAllPlayTable = (entries: AllPlayEntryInput[]): AllPlayTableRow[] => {
  const rows: AllPlayTableRow[] = []

  for (const [leagueId, group] of groupByLeague(entries)) {
    const tallies = new Map<number, Tally>(
      group.map((entry) => [entry.entryApiId, { wins: 0, draws: 0, losses: 0 }]),
    )

    for (const scores of eventScores(group).values()) {
      for (const score of scores) {
        const tally = tallies.get(score.entryApiId)
        if (!tally) continue
        for (const opponent of scores) {
          if (opponent.entryApiId === score.entryApiId) continue
          if (score.points > opponent.points) tally.wins++
          else if (score.points < opponent.points) tally.losses++
          else tally.draws++
        }
      }
    }

    const totals = new Map(
      group.map((entry) => [
        entry.entryApiId,
        entry.rows.reduce((sum, row) => sum + row.points, 0),
      ]),
    )

    const winPcts = new Map(
      group.map((entry) => {
        const tally = tallies.get(entry.entryApiId) ?? { wins: 0, draws: 0, losses: 0 }
        const games = tally.wins + tally.draws + tally.losses
        const pct = games === 0 ? 0 : ((tally.wins + tally.draws * HALF_WIN) / games) * PCT
        return [entry.entryApiId, pct]
      }),
    )

    const actualOrder = [...group].sort(
      (a, b) =>
        (totals.get(b.entryApiId) ?? 0) - (totals.get(a.entryApiId) ?? 0) ||
        a.entryApiId - b.entryApiId,
    )
    const actualRanks = new Map(actualOrder.map((entry, index) => [entry.entryApiId, index + 1]))

    const allPlayOrder = [...group].sort(
      (a, b) =>
        (winPcts.get(b.entryApiId) ?? 0) - (winPcts.get(a.entryApiId) ?? 0) ||
        (totals.get(b.entryApiId) ?? 0) - (totals.get(a.entryApiId) ?? 0) ||
        a.entryApiId - b.entryApiId,
    )
    const allPlayRanks = new Map(allPlayOrder.map((entry, index) => [entry.entryApiId, index + 1]))

    for (const entry of group) {
      const tally = tallies.get(entry.entryApiId) ?? { wins: 0, draws: 0, losses: 0 }
      const actualRank = actualRanks.get(entry.entryApiId) ?? 0
      const allPlayRank = allPlayRanks.get(entry.entryApiId) ?? 0
      rows.push({
        entryApiId: entry.entryApiId,
        leagueId,
        wins: tally.wins,
        draws: tally.draws,
        losses: tally.losses,
        winPct: round1(winPcts.get(entry.entryApiId) ?? 0),
        totalPoints: totals.get(entry.entryApiId) ?? 0,
        actualRank,
        allPlayRank,
        luckDelta: allPlayRank - actualRank,
      })
    }
  }

  return rows
}

export const computePairwiseGrids = (entries: AllPlayEntryInput[]): PairwiseGrid[] => {
  const table = computeAllPlayTable(entries)
  const grids: PairwiseGrid[] = []

  for (const [leagueId, group] of groupByLeague(entries)) {
    const order = table
      .filter((row) => row.leagueId === leagueId)
      .sort((a, b) => a.allPlayRank - b.allPlayRank)
      .map((row) => row.entryApiId)

    const pointsByEntryEvent = new Map<number, Map<number, number>>(
      group.map((entry) => [
        entry.entryApiId,
        new Map(entry.rows.map((row) => [row.event, row.points])),
      ]),
    )
    const events = [...new Set(group.flatMap((entry) => entry.rows.map((row) => row.event)))]

    const cells = order.map((rowId) =>
      order.map((colId) => {
        const cell: PairwiseCell = { wins: 0, draws: 0, losses: 0 }
        if (rowId === colId) return cell
        for (const event of events) {
          const own = pointsByEntryEvent.get(rowId)?.get(event)
          const theirs = pointsByEntryEvent.get(colId)?.get(event)
          if (own === undefined || theirs === undefined) continue
          if (own > theirs) cell.wins++
          else if (own < theirs) cell.losses++
          else cell.draws++
        }
        return cell
      }),
    )

    grids.push({ leagueId, order, cells })
  }

  return grids
}

export const computeRivalExtremes = (grid: PairwiseGrid): RivalExtreme[] =>
  grid.order.map((entryApiId, rowIndex) => {
    let nemesis: { apiId: number; cell: PairwiseCell; net: number } | null = null
    let bunny: { apiId: number; cell: PairwiseCell; net: number } | null = null

    grid.order.forEach((opponentApiId, colIndex) => {
      if (opponentApiId === entryApiId) return
      const cell = grid.cells[rowIndex]?.[colIndex]
      if (!cell) return
      const net = cell.wins - cell.losses
      if (!nemesis || net < nemesis.net) nemesis = { apiId: opponentApiId, cell, net }
      if (!bunny || net > bunny.net) bunny = { apiId: opponentApiId, cell, net }
    })

    return {
      entryApiId,
      nemesisApiId: nemesis ? nemesis.apiId : null,
      nemesisRecord: nemesis ? nemesis.cell : null,
      bunnyApiId: bunny ? bunny.apiId : null,
      bunnyRecord: bunny ? bunny.cell : null,
    }
  })
```

Also add to `src/lib/utils/fmt.ts`:

```ts
export const round1 = (n: number): number => Math.round(n * 10) / 10

export const fmtSigned = (n: number): string => (n > 0 ? `+${n}` : String(n))
```

- [ ] **Step 5: Run tests to green, then quality gates**

Run: `pnpm test src/lib/fpl/allPlay.test.ts` → PASS. Then `pnpm typecheck && pnpm check`.

- [ ] **Step 6: Commit**

```bash
git add src/types/fpl.types.ts src/lib/fpl/allPlay.ts src/lib/fpl/allPlay.test.ts src/lib/utils/fmt.ts
git commit -m "feat: add all-play records, pairwise grids and rival extremes"
```

---

### Task 2: Score distribution lib

**Files:**
- Create: `src/lib/fpl/scoreDistribution.ts`
- Test: `src/lib/fpl/scoreDistribution.test.ts`

**Interfaces:**
- Produces: `ScoreDistribution` (`average`, `stdDev`, `floor`, `ceiling`, `over50`, `over60`, `over70`), `computeScoreDistribution(points: number[])`.

- [ ] **Step 1: Write failing tests**

```ts
import { computeScoreDistribution } from "@pbd/lib/fpl/scoreDistribution"
import { describe, expect, it } from "vitest"

describe("computeScoreDistribution", () => {
  it("computes average and population standard deviation", () => {
    const result = computeScoreDistribution([40, 60])

    expect(result.average).toBe(50)
    expect(result.stdDev).toBe(10)
  })

  it("interpolates floor and ceiling percentiles", () => {
    const result = computeScoreDistribution([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])

    expect(result.floor).toBe(19)
    expect(result.ceiling).toBe(91)
  })

  it("counts gameweeks at or above each threshold", () => {
    const result = computeScoreDistribution([49, 50, 60, 70, 71])

    expect(result.over50).toBe(4)
    expect(result.over60).toBe(3)
    expect(result.over70).toBe(2)
  })

  it("returns a zeroed distribution for an empty season", () => {
    expect(computeScoreDistribution([])).toEqual({
      average: 0,
      stdDev: 0,
      floor: 0,
      ceiling: 0,
      over50: 0,
      over60: 0,
      over70: 0,
    })
  })

  it("handles a single gameweek without spread", () => {
    const result = computeScoreDistribution([64])

    expect(result).toMatchObject({ average: 64, stdDev: 0, floor: 64, ceiling: 64 })
  })
})
```

- [ ] **Step 2: Run to fail** — `pnpm test src/lib/fpl/scoreDistribution.test.ts`

- [ ] **Step 3: Implement**

```ts
import { round1 } from "@pbd/lib/utils/fmt"

export type ScoreDistribution = {
  average: number
  stdDev: number
  floor: number
  ceiling: number
  over50: number
  over60: number
  over70: number
}

const FLOOR_PERCENTILE = 0.1
const CEILING_PERCENTILE = 0.9
const THRESHOLD_LOW = 50
const THRESHOLD_MID = 60
const THRESHOLD_HIGH = 70

const percentile = (sorted: number[], fraction: number): number => {
  const last = sorted.length - 1
  if (last < 0) return 0
  const index = last * fraction
  const lowerIndex = Math.floor(index)
  const lowerValue = sorted[lowerIndex] ?? 0
  const upperValue = sorted[Math.ceil(index)] ?? lowerValue
  return lowerValue + (upperValue - lowerValue) * (index - lowerIndex)
}

export const computeScoreDistribution = (points: number[]): ScoreDistribution => {
  if (points.length === 0)
    return { average: 0, stdDev: 0, floor: 0, ceiling: 0, over50: 0, over60: 0, over70: 0 }

  const average = points.reduce((sum, p) => sum + p, 0) / points.length
  const variance = points.reduce((sum, p) => sum + (p - average) ** 2, 0) / points.length
  const sorted = [...points].sort((a, b) => a - b)

  return {
    average: round1(average),
    stdDev: round1(Math.sqrt(variance)),
    floor: round1(percentile(sorted, FLOOR_PERCENTILE)),
    ceiling: round1(percentile(sorted, CEILING_PERCENTILE)),
    over50: points.filter((p) => p >= THRESHOLD_LOW).length,
    over60: points.filter((p) => p >= THRESHOLD_MID).length,
    over70: points.filter((p) => p >= THRESHOLD_HIGH).length,
  }
}
```

- [ ] **Step 4: Green + gates** — `pnpm test src/lib/fpl/scoreDistribution.test.ts && pnpm typecheck && pnpm check`

- [ ] **Step 5: Commit** — `git add src/lib/fpl/scoreDistribution.* && git commit -m "feat: add per-manager score distribution maths"`

---

### Task 3: Streaks lib

**Files:**
- Create: `src/lib/fpl/streaks.ts`
- Test: `src/lib/fpl/streaks.test.ts`

**Interfaces:**
- Consumes: `AllPlayEntryInput` from `@pbd/lib/fpl/allPlay`.
- Produces: `StreakRow` (`entryApiId`, `leagueId`, `current: { type: "hot" | "cold" | "none"; length }`, `longestHot`, `longestCold`), `computeStreaks(entries)`.
- Rules: per-league per-event median (mean of two middle values when even); `points > median` hot, `< median` cold, `=== median` breaks both.

- [ ] **Step 1: Write failing tests**

```ts
import { computeStreaks } from "@pbd/lib/fpl/streaks"
import { describe, expect, it } from "vitest"

const entry = (entryApiId: number, leagueId: number, points: number[]) => ({
  entryApiId,
  leagueId,
  rows: points.map((p, i) => ({ event: i + 1, points: p })),
})

describe("computeStreaks", () => {
  it("tracks a current hot streak of consecutive above-median weeks", () => {
    const rows = computeStreaks([
      entry(1, 10, [10, 60, 60]),
      entry(2, 10, [50, 50, 50]),
      entry(3, 10, [60, 40, 40]),
      entry(4, 10, [70, 10, 10]),
    ])

    expect(rows.find((r) => r.entryApiId === 1)?.current).toEqual({ type: "hot", length: 2 })
  })

  it("breaks a streak on a week exactly at the median", () => {
    const rows = computeStreaks([entry(1, 10, [60, 50, 60]), entry(2, 10, [40, 50, 40])])

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first?.current).toEqual({ type: "hot", length: 1 })
    expect(first?.longestHot).toBe(1)
  })

  it("records the longest hot and cold runs across the season", () => {
    const rows = computeStreaks([
      entry(1, 10, [60, 60, 10, 10, 10, 60]),
      entry(2, 10, [40, 40, 50, 50, 50, 40]),
    ])

    const first = rows.find((r) => r.entryApiId === 1)
    expect(first?.longestHot).toBe(2)
    expect(first?.longestCold).toBe(3)
  })

  it("returns none for an entry with no events", () => {
    const rows = computeStreaks([entry(1, 10, [])])

    expect(rows.find((r) => r.entryApiId === 1)?.current).toEqual({ type: "none", length: 0 })
  })
})
```

- [ ] **Step 2: Run to fail** — `pnpm test src/lib/fpl/streaks.test.ts`

- [ ] **Step 3: Implement**

```ts
import type { AllPlayEntryInput } from "@pbd/lib/fpl/allPlay"

export type StreakState = "hot" | "cold" | "none"

export type StreakRow = {
  entryApiId: number
  leagueId: number
  current: { type: StreakState; length: number }
  longestHot: number
  longestCold: number
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const upper = sorted[middle] ?? 0
  if (sorted.length % 2 === 1) return upper
  const lower = sorted[middle - 1] ?? upper
  return (lower + upper) / 2
}

export const computeStreaks = (entries: AllPlayEntryInput[]): StreakRow[] => {
  const byLeague = new Map<number, AllPlayEntryInput[]>()
  for (const entry of entries) {
    const group = byLeague.get(entry.leagueId) ?? []
    group.push(entry)
    byLeague.set(entry.leagueId, group)
  }

  const rows: StreakRow[] = []

  for (const [leagueId, group] of byLeague) {
    const pointsByEvent = new Map<number, number[]>()
    for (const entry of group) {
      for (const row of entry.rows) {
        const scores = pointsByEvent.get(row.event) ?? []
        scores.push(row.points)
        pointsByEvent.set(row.event, scores)
      }
    }
    const medians = new Map(
      [...pointsByEvent.entries()].map(([event, scores]) => [event, median(scores)]),
    )

    for (const entry of group) {
      const ordered = [...entry.rows].sort((a, b) => a.event - b.event)
      let currentType: StreakState = "none"
      let currentLength = 0
      let longestHot = 0
      let longestCold = 0

      for (const row of ordered) {
        const eventMedian = medians.get(row.event) ?? 0
        const state: StreakState =
          row.points > eventMedian ? "hot" : row.points < eventMedian ? "cold" : "none"

        if (state === "none") {
          currentType = "none"
          currentLength = 0
          continue
        }
        if (state === currentType) currentLength++
        else {
          currentType = state
          currentLength = 1
        }
        if (currentType === "hot") longestHot = Math.max(longestHot, currentLength)
        if (currentType === "cold") longestCold = Math.max(longestCold, currentLength)
      }

      rows.push({
        entryApiId: entry.entryApiId,
        leagueId,
        current: { type: currentType, length: currentLength },
        longestHot,
        longestCold,
      })
    }
  }

  return rows
}
```

- [ ] **Step 4: Green + gates** — `pnpm test src/lib/fpl/streaks.test.ts && pnpm typecheck && pnpm check`

- [ ] **Step 5: Commit** — `git add src/lib/fpl/streaks.* && git commit -m "feat: add hot and cold streak derivation"`

---

### Task 4: Records lib

**Files:**
- Create: `src/lib/fpl/records.ts`
- Test: `src/lib/fpl/records.test.ts`

**Interfaces:**
- Produces: `RecordsEntryInput` (`entryApiId`, `leagueId`, `rows: { event; points; pointsOnBench }[]`), `RecordKey`, `RecordHolder` (`entryApiId`, `event`, `points`), `LeagueRecordEntry` (`key`, `leagueId`, `value`, `holders`), `computeLeagueRecords(entries)`.
- Semantics: `biggest-margin` (event winner over runner-up, holders = winner(s)); `closest-call` (minimum winner-to-runner-up gap, holders = runner(s)-up); `highest-week` (league combined points, holders = []); `best-non-winner` (highest score that didn't top its event); `lowest-winner` (lowest event-topping score); `biggest-bench-waste` (max single-event `pointsOnBench`, omitted while the max is 0). Ties produce multiple holders; keys returned in the order above; leagues with no events return [].

- [ ] **Step 1: Write failing tests**

```ts
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
    const records = computeLeagueRecords([
      entry(1, 10, [[1, 50, 0]]),
      entry(2, 10, [[1, 40, 0]]),
    ])

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
```

- [ ] **Step 2: Run to fail** — `pnpm test src/lib/fpl/records.test.ts`

- [ ] **Step 3: Implement**

```ts
export type RecordsEntryInput = {
  entryApiId: number
  leagueId: number
  rows: { event: number; points: number; pointsOnBench: number }[]
}

export type RecordKey =
  | "biggest-margin"
  | "closest-call"
  | "highest-week"
  | "best-non-winner"
  | "lowest-winner"
  | "biggest-bench-waste"

export type RecordHolder = { entryApiId: number; event: number; points: number }

export type LeagueRecordEntry = {
  key: RecordKey
  leagueId: number
  value: number
  holders: RecordHolder[]
}

type Extreme = { value: number; holders: RecordHolder[] }

const better = (candidate: number, current: Extreme | null, direction: "max" | "min"): boolean =>
  current === null || (direction === "max" ? candidate > current.value : candidate < current.value)

const track = (
  current: Extreme | null,
  candidate: number,
  holder: RecordHolder | null,
  direction: "max" | "min",
): Extreme => {
  if (better(candidate, current, direction))
    return { value: candidate, holders: holder ? [holder] : [] }
  if (current && candidate === current.value && holder) current.holders.push(holder)
  return current ?? { value: candidate, holders: holder ? [holder] : [] }
}

export const computeLeagueRecords = (entries: RecordsEntryInput[]): LeagueRecordEntry[] => {
  const byLeague = new Map<number, RecordsEntryInput[]>()
  for (const entry of entries) {
    const group = byLeague.get(entry.leagueId) ?? []
    group.push(entry)
    byLeague.set(entry.leagueId, group)
  }

  const records: LeagueRecordEntry[] = []

  for (const [leagueId, group] of byLeague) {
    const byEvent = new Map<number, { entryApiId: number; points: number }[]>()
    for (const entry of group) {
      for (const row of entry.rows) {
        const scores = byEvent.get(row.event) ?? []
        scores.push({ entryApiId: entry.entryApiId, points: row.points })
        byEvent.set(row.event, scores)
      }
    }

    let margin: Extreme | null = null
    let closest: Extreme | null = null
    let highestWeek: Extreme | null = null
    let bestNonWinner: Extreme | null = null
    let lowestWinner: Extreme | null = null
    let benchWaste: Extreme | null = null

    for (const [event, scores] of byEvent) {
      if (scores.length < 2) continue
      const sorted = [...scores].sort((a, b) => b.points - a.points)
      const top = sorted[0]
      const second = sorted[1]
      if (!top || !second) continue

      const topScorers = sorted.filter((s) => s.points === top.points)
      const gap = top.points - second.points

      for (const winner of topScorers) {
        margin = track(margin, gap, { entryApiId: winner.entryApiId, event, points: winner.points }, "max")
        lowestWinner = track(
          lowestWinner,
          winner.points,
          { entryApiId: winner.entryApiId, event, points: winner.points },
          "min",
        )
      }

      const runnersUp = sorted.filter((s) => s.points === second.points && s.points < top.points)
      for (const runner of runnersUp) {
        closest = track(closest, gap, { entryApiId: runner.entryApiId, event, points: runner.points }, "min")
      }
      if (runnersUp.length === 0)
        closest = track(closest, 0, second ? { entryApiId: second.entryApiId, event, points: second.points } : null, "min")

      const weekTotal = scores.reduce((sum, s) => sum + s.points, 0)
      highestWeek = track(highestWeek, weekTotal, null, "max")

      for (const score of sorted) {
        if (score.points === top.points) continue
        bestNonWinner = track(
          bestNonWinner,
          score.points,
          { entryApiId: score.entryApiId, event, points: score.points },
          "max",
        )
      }
    }

    for (const entry of group) {
      for (const row of entry.rows) {
        if (row.pointsOnBench <= 0) continue
        benchWaste = track(
          benchWaste,
          row.pointsOnBench,
          { entryApiId: entry.entryApiId, event: row.event, points: row.pointsOnBench },
          "max",
        )
      }
    }

    const push = (key: RecordKey, extreme: Extreme | null): void => {
      if (extreme) records.push({ key, leagueId, value: extreme.value, holders: extreme.holders })
    }
    push("biggest-margin", margin)
    push("closest-call", closest)
    push("highest-week", highestWeek)
    push("best-non-winner", bestNonWinner)
    push("lowest-winner", lowestWinner)
    push("biggest-bench-waste", benchWaste)
  }

  return records
}
```

Note the tied-top case: when two entries share the top score, `gap` is `top − second` where `second` is the next distinct-or-equal score in sorted order; a fully tied top yields runnersUp = [] and a closest-call of 0 held by the tied co-winner — the first test suite pins the ordinary cases, and the tie test pins holder multiplicity.

- [ ] **Step 4: Green + gates** — `pnpm test src/lib/fpl/records.test.ts && pnpm typecheck && pnpm check`

- [ ] **Step 5: Commit** — `git add src/lib/fpl/records.* && git commit -m "feat: add league records derivation"`

---

### Task 5: Season scores assembler

**Files:**
- Create: `src/server/fpl/seasonScores.ts`

**Interfaces:**
- Produces: `SeasonScoreRow` (`event`, `points`, `totalPoints`, `pointsOnBench`, `eventTransfers`), `SeasonEntry` (`entryApiId`, `leagueId`, `managerName`, `teamName`, `rows`), `SeasonScores` (`finishedEvents`, `averageByEvent: { event; average }[]`, `stopEvent`, `entries`), `fetchSeasonScores(leagueIds: number[])`.
- `SeasonEntry` is structurally assignable to `AllPlayEntryInput` and (rows include `pointsOnBench`) to `RecordsEntryInput`.

- [ ] **Step 1: Implement**

```ts
import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import type { BootstrapStaticResponse, EntryHistoryResponse } from "@pbd/types/fpl.types"

export type SeasonScoreRow = {
  event: number
  points: number
  totalPoints: number
  pointsOnBench: number
  eventTransfers: number
}

export type SeasonEntry = {
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  rows: SeasonScoreRow[]
}

export type SeasonScores = {
  finishedEvents: number[]
  averageByEvent: { event: number; average: number }[]
  stopEvent: number
  entries: SeasonEntry[]
}

const FULL_SEASON_STOP_EVENT = 38

export const fetchSeasonScores = async (leagueIds: number[]): Promise<SeasonScores> => {
  const [allDetails, bootstrap] = await Promise.all([
    Promise.all(leagueIds.map(fetchLeagueDetails)),
    fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
  ])

  const finishedEvents = bootstrap.events.data
    .filter((event) => event.finished)
    .map((event) => event.id)
    .sort((a, b) => a - b)
  const finishedSet = new Set(finishedEvents)

  const averageByEvent = bootstrap.events.data
    .filter((event) => event.finished && event.average_entry_score > 0)
    .map((event) => ({ event: event.id, average: event.average_entry_score }))

  const stopEvent = allDetails.reduce(
    (max, details) => Math.max(max, details.league.stop_event),
    FULL_SEASON_STOP_EVENT,
  )

  const entriesWithLeague = allDetails.flatMap((details, index) =>
    details.league_entries.map((entry) => ({
      entry,
      leagueId: leagueIds[index] ?? leagueIds[0] ?? 0,
    })),
  )

  const histories = await Promise.all(
    entriesWithLeague.map(({ entry }) =>
      fetchFpl<EntryHistoryResponse>(
        FPL_ENDPOINTS.entryHistory(entry.entry_id),
        SERVER_TTL.ENTRY_HISTORY,
      ),
    ),
  )

  const entries = entriesWithLeague.map(({ entry, leagueId }, index) => ({
    entryApiId: entry.id,
    leagueId,
    managerName:
      PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
      PARTICIPANT_BY_API_ID[entry.id]?.name ??
      `${entry.player_first_name} ${entry.player_last_name}`,
    teamName: entry.entry_name,
    rows: (histories[index]?.history ?? [])
      .filter((row) => finishedSet.has(row.event))
      .sort((a, b) => a.event - b.event)
      .map((row) => ({
        event: row.event,
        points: row.points,
        totalPoints: row.total_points,
        pointsOnBench: row.points_on_bench,
        eventTransfers: row.event_transfers,
      })),
  }))

  return { finishedEvents, averageByEvent, stopEvent, entries }
}
```

- [ ] **Step 2: Gates** — `pnpm typecheck && pnpm check`

- [ ] **Step 3: Commit** — `git add src/server/fpl/seasonScores.ts && git commit -m "feat: add shared season scores assembler"`

---

### Task 6: seasonStats router

**Files:**
- Create: `src/server/routers/fpl/seasonStats.ts`
- Modify: `src/server/routers/fpl.ts` (spread `seasonStatsProcedures`)

**Interfaces:**
- Consumes: `fetchSeasonScores`, Task 1–4 lib functions, `leagueIdsInput`.
- Produces procedures (all input `{ leagueIds }`): `allPlayTable`, `scoreDistributionTable`, `benchTable`, `formTable`, `streaksTable`, `vsWorldTable`, `tinkerTable`, `paceTable`, `recordsBoard`, `rivalryGrid`. Rows are unranked; views sort and rank. Every row carries `entryApiId`, `leagueId`, `managerName`, `teamName`.

- [ ] **Step 1: Implement `src/server/routers/fpl/seasonStats.ts`**

```ts
import {
  computeAllPlayTable,
  computePairwiseGrids,
  computeRivalExtremes,
} from "@pbd/lib/fpl/allPlay"
import { computeLeagueRecords } from "@pbd/lib/fpl/records"
import { computeScoreDistribution } from "@pbd/lib/fpl/scoreDistribution"
import { computeStreaks } from "@pbd/lib/fpl/streaks"
import { round1 } from "@pbd/lib/utils/fmt"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { TRPCRouterRecord } from "@trpc/server"

const FORM_WINDOW = 6

type EntryMeta = { entryApiId: number; leagueId: number; managerName: string; teamName: string }

const metaOf = (entry: SeasonEntry): EntryMeta => ({
  entryApiId: entry.entryApiId,
  leagueId: entry.leagueId,
  managerName: entry.managerName,
  teamName: entry.teamName,
})

export const seasonStatsProcedures = {
  allPlayTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const table = computeAllPlayTable(season.entries)
    const meta = new Map(season.entries.map((entry) => [entry.entryApiId, metaOf(entry)]))
    return table.map((row) => ({ ...meta.get(row.entryApiId), ...row }))
  }),

  scoreDistributionTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    return season.entries.map((entry) => ({
      ...metaOf(entry),
      ...computeScoreDistribution(entry.rows.map((row) => row.points)),
    }))
  }),

  benchTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    return season.entries.map((entry) => {
      const benchTotal = entry.rows.reduce((sum, row) => sum + row.pointsOnBench, 0)
      const startingTotal = entry.rows.reduce((sum, row) => sum + row.points, 0)
      const played = entry.rows.length
      const worst = entry.rows.reduce(
        (acc, row) => (row.pointsOnBench > acc.pointsOnBench ? row : acc),
        { event: 0, pointsOnBench: 0 },
      )
      const squadTotal = startingTotal + benchTotal
      return {
        ...metaOf(entry),
        benchTotal,
        benchAvg: played === 0 ? 0 : round1(benchTotal / played),
        worstEvent: worst.event,
        worstPoints: worst.pointsOnBench,
        efficiencyPct: squadTotal === 0 ? 100 : round1((startingTotal / squadTotal) * 100),
      }
    })
  }),

  formTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const recent = season.entries.map((entry) => ({ ...entry, rows: entry.rows.slice(-FORM_WINDOW) }))
    const table = computeAllPlayTable(recent)
    const meta = new Map(season.entries.map((entry) => [entry.entryApiId, metaOf(entry)]))
    return table.map((row) => {
      const played = recent.find((entry) => entry.entryApiId === row.entryApiId)?.rows.length ?? 0
      return {
        ...meta.get(row.entryApiId),
        entryApiId: row.entryApiId,
        leagueId: row.leagueId,
        formPoints: row.totalPoints,
        formAvg: played === 0 ? 0 : round1(row.totalPoints / played),
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        played,
      }
    })
  }),

  streaksTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const rows = computeStreaks(season.entries)
    const meta = new Map(season.entries.map((entry) => [entry.entryApiId, metaOf(entry)]))
    return rows.map((row) => ({ ...meta.get(row.entryApiId), ...row }))
  }),

  vsWorldTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const averages = new Map(season.averageByEvent.map((row) => [row.event, row.average]))
    return season.entries.map((entry) => {
      const compared = entry.rows.filter((row) => averages.has(row.event))
      const beats = compared.filter((row) => row.points > (averages.get(row.event) ?? 0)).length
      const marginSum = compared.reduce(
        (sum, row) => sum + (row.points - (averages.get(row.event) ?? 0)),
        0,
      )
      return {
        ...metaOf(entry),
        beats,
        gwCount: compared.length,
        beatPct: compared.length === 0 ? 0 : round1((beats / compared.length) * 100),
        avgMargin: compared.length === 0 ? 0 : round1(marginSum / compared.length),
      }
    })
  }),

  tinkerTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    return season.entries.map((entry) => {
      const totalMoves = entry.rows.reduce((sum, row) => sum + row.eventTransfers, 0)
      const busiest = entry.rows.reduce(
        (acc, row) => (row.eventTransfers > acc.eventTransfers ? row : acc),
        { event: 0, eventTransfers: 0 },
      )
      const played = entry.rows.length
      return {
        ...metaOf(entry),
        totalMoves,
        avgPerGw: played === 0 ? 0 : round1(totalMoves / played),
        busiestEvent: busiest.event,
        busiestCount: busiest.eventTransfers,
      }
    })
  }),

  paceTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const projections = season.entries.map((entry) => {
      const total = entry.rows.reduce((sum, row) => sum + row.points, 0)
      const played = entry.rows.length
      const ppg = played === 0 ? 0 : total / played
      return { entry, total, ppg, projected: Math.round(ppg * season.stopEvent) }
    })
    const topProjected = projections.reduce((max, row) => Math.max(max, row.projected), 0)
    return projections.map(({ entry, total, ppg, projected }) => ({
      ...metaOf(entry),
      totalPoints: total,
      ppg: round1(ppg),
      projectedTotal: projected,
      gapToTopPace: topProjected - projected,
    }))
  }),

  recordsBoard: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = new Map(season.entries.map((entry) => [entry.entryApiId, metaOf(entry)]))
    return computeLeagueRecords(season.entries).map((record) => ({
      key: record.key,
      leagueId: record.leagueId,
      value: record.value,
      holders: record.holders.map((holder) => ({
        ...holder,
        managerName: meta.get(holder.entryApiId)?.managerName ?? `Entry ${holder.entryApiId}`,
        teamName: meta.get(holder.entryApiId)?.teamName ?? "",
      })),
    }))
  }),

  rivalryGrid: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = new Map(season.entries.map((entry) => [entry.entryApiId, metaOf(entry)]))
    return computePairwiseGrids(season.entries).map((grid) => ({
      leagueId: grid.leagueId,
      managers: grid.order.map((entryApiId) => ({
        entryApiId,
        managerName: meta.get(entryApiId)?.managerName ?? `Entry ${entryApiId}`,
        teamName: meta.get(entryApiId)?.teamName ?? "",
      })),
      cells: grid.cells,
      extremes: computeRivalExtremes(grid),
    }))
  }),
} satisfies TRPCRouterRecord
```

Note: the `{ ...meta.get(id), ...row }` spread keeps meta fields optional in inference — instead build rows explicitly where inference matters. If `tsc` flags possibly-undefined meta spreads, replace with a `metaOrFallback(id)` helper returning a concrete `EntryMeta` (`managerName: \`Entry ${id}\``, `teamName: ""`).

- [ ] **Step 2: Register in `src/server/routers/fpl.ts`**

Add `import { seasonStatsProcedures } from "./fpl/seasonStats"` and spread `...seasonStatsProcedures` in `createTRPCRouter`.

- [ ] **Step 3: Gates** — `pnpm typecheck && pnpm check && pnpm test`

- [ ] **Step 4: Commit** — `git add src/server/routers/fpl.ts src/server/routers/fpl/seasonStats.ts && git commit -m "feat: add season stats trpc procedures"`

---

### Task 7: Cache options + hooks (wave 1)

**Files:**
- Modify: `src/hooks/fpl/fpl.cache.ts`
- Create: `src/hooks/fpl/useAllPlayTable.ts`, `useScoreDistributionTable.ts`, `useBenchTable.ts`, `useFormTable.ts`, `useStreaksTable.ts`, `useVsWorldTable.ts`, `useTinkerTable.ts`, `usePaceTable.ts`, `useRecordsBoard.ts`, `useRivalryGrid.ts`

**Interfaces:**
- Produces: `use<Name>({ leagueIds })` suspense hooks; options factories `<name>Options(trpc, input)` with `FRESHNESS.gameweek`.

- [ ] **Step 1: Add options factories to `fpl.cache.ts`** (append; same shape for all ten — shown in full):

```ts
export const allPlayTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["allPlayTable"]) => ({
  ...trpc.fpl.allPlayTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const scoreDistributionTableOptions = (
  trpc: Trpc,
  input: RouterInput["fpl"]["scoreDistributionTable"],
) => ({
  ...trpc.fpl.scoreDistributionTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const benchTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["benchTable"]) => ({
  ...trpc.fpl.benchTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const formTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["formTable"]) => ({
  ...trpc.fpl.formTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const streaksTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["streaksTable"]) => ({
  ...trpc.fpl.streaksTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const vsWorldTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["vsWorldTable"]) => ({
  ...trpc.fpl.vsWorldTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const tinkerTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["tinkerTable"]) => ({
  ...trpc.fpl.tinkerTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const paceTableOptions = (trpc: Trpc, input: RouterInput["fpl"]["paceTable"]) => ({
  ...trpc.fpl.paceTable.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const recordsBoardOptions = (trpc: Trpc, input: RouterInput["fpl"]["recordsBoard"]) => ({
  ...trpc.fpl.recordsBoard.queryOptions(input),
  ...FRESHNESS.gameweek,
})

export const rivalryGridOptions = (trpc: Trpc, input: RouterInput["fpl"]["rivalryGrid"]) => ({
  ...trpc.fpl.rivalryGrid.queryOptions(input),
  ...FRESHNESS.gameweek,
})
```

- [ ] **Step 2: Create the ten hooks** — each file follows this exact template (shown for allPlay; replicate with the matching names):

```ts
import { allPlayTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useAllPlayTable = (input: RouterInput["fpl"]["allPlayTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(allPlayTableOptions(trpc, input))
}
```

- [ ] **Step 3: Gates** — `pnpm typecheck && pnpm check`

- [ ] **Step 4: Commit** — `git add src/hooks/fpl && git commit -m "feat: add season stats query hooks"`

---

### Task 8: ManagerStatList shared renderer

**Files:**
- Create: `src/components/Tables/ManagerStatList.tsx`

**Interfaces:**
- Produces: `ManagerStatRow` (`rank`, `entryApiId`, `leagueId`, `managerName`, `teamName`, `primary: { value: string; label: string }`, `detail?: string`) and `ManagerStatList({ rows, emptyTitle, emptyMessage })`. Opens `PlayerDetails` on row tap exactly like `GwCountsTable` (leagueName from row.leagueId, leaguePosition from `useRankMaps`, overallPosition = rank).

- [ ] **Step 1: Implement**

```tsx
"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge"
import PlayerDetails from "@pbd/components/Modals/PlayerDetails"
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useState } from "react"

export type ManagerStatRow = {
  rank: number
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  primary: { value: string; label: string }
  detail?: string
}

type Props = {
  rows: ManagerStatRow[]
  emptyTitle: string
  emptyMessage: string
}

export const ManagerStatList = ({ rows, emptyTitle, emptyMessage }: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(null)
  const { leagueRankMap } = useRankMaps()

  if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            type="button"
            key={row.entryApiId}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
            onClick={() =>
              setSelectedPlayer({
                apiId: row.entryApiId,
                playerName: row.managerName,
                teamName: row.teamName,
                leagueName:
                  row.leagueId === LEAGUE_IDS.PREMIERSHIP
                    ? LEAGUE_LABELS.premiership
                    : LEAGUE_LABELS.championship,
                leagueId: row.leagueId,
                leaguePosition: leagueRankMap.get(row.entryApiId) ?? 0,
                overallPosition: row.rank,
              })
            }
          >
            <RankBadge rank={row.rank} />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{row.managerName}</p>
              <p className="truncate text-xs text-muted-foreground">{row.teamName}</p>
              {row.detail && (
                <p className="truncate text-xs tabular-nums text-muted-foreground/80">
                  {row.detail}
                </p>
              )}
            </div>

            <div className="w-16 shrink-0 text-right">
              <p className="text-base font-black tabular-nums text-foreground">
                {row.primary.value}
              </p>
              <p className="text-[10px] text-muted-foreground/60">{row.primary.label}</p>
            </div>
          </button>
        ))}
      </div>

      <PlayerDetails
        open={selectedPlayer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedPlayer(null)
        }}
        player={selectedPlayer}
      />
    </>
  )
}
```

- [ ] **Step 2: Gates + commit** — `pnpm typecheck && pnpm check`, then `git add src/components/Tables/ManagerStatList.tsx && git commit -m "feat: add shared manager stat list renderer"`

---

### Task 9: Season view components

**Files:**
- Create in `src/components/Tables/`: `AllPlayTable.tsx`, `ScoreDistributionTable.tsx`, `BenchTable.tsx`, `FormTable.tsx`, `StreaksTable.tsx`, `VsWorldTable.tsx`, `TinkerTable.tsx`, `PaceTable.tsx`

**Interfaces:**
- Consumes Task 7 hooks + `ManagerStatList` + `fmtSigned`/`fmtPts`.
- Produces client components: `AllPlayTable({ leagueIds, variant: "all-play" | "luck" })`, `ScoreDistributionTable({ leagueIds, variant: "consistency" | "floor-ceiling" | "thresholds" })`, and `{ leagueIds }`-only components for the rest. Views sort, rank (index + 1), format.

- [ ] **Step 1: Implement each view.** Full exemplar (`AllPlayTable.tsx`):

```tsx
"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useAllPlayTable } from "@pbd/hooks/fpl/useAllPlayTable"
import { fmtSigned } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  variant: "all-play" | "luck"
}

export const AllPlayTable = ({ leagueIds, variant }: Props): JSX.Element => {
  const { data } = useAllPlayTable({ leagueIds })

  const sorted = [...data].sort((a, b) =>
    variant === "luck"
      ? b.luckDelta - a.luckDelta || b.winPct - a.winPct
      : b.winPct - a.winPct || b.totalPoints - a.totalPoints,
  )

  const rows: ManagerStatRow[] = sorted.map((row, index) => ({
    rank: index + 1,
    entryApiId: row.entryApiId,
    leagueId: row.leagueId,
    managerName: row.managerName,
    teamName: row.teamName,
    primary:
      variant === "luck"
        ? { value: fmtSigned(row.luckDelta), label: "Luck" }
        : { value: `${row.winPct}%`, label: "Win %" },
    detail:
      variant === "luck"
        ? `Table ${row.actualRank} · All-play ${row.allPlayRank}`
        : `W ${row.wins} · D ${row.draws} · L ${row.losses}`,
  }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
```

The remaining seven follow the identical shape; their variant-specific mapping (empty copy is the same everywhere):

- `ScoreDistributionTable` (hook `useScoreDistributionTable`): rows where every `gwCount`-like field is absent — treat `data.length === 0` or all `average === 0 && over50 === 0` as normal render; sorting/primary/detail per variant:
  - `consistency`: sort `a.stdDev - b.stdDev || b.average - a.average`; primary `±${row.stdDev}` label `Std Dev`; detail `avg ${row.average}`.
  - `floor-ceiling`: sort `b.ceiling - a.ceiling || b.floor - a.floor`; primary `${row.ceiling}` label `Ceiling`; detail `floor ${row.floor} · avg ${row.average}`.
  - `thresholds`: sort `b.over60 - a.over60 || b.over70 - a.over70 || b.over50 - a.over50`; primary `${row.over60}` label `60+ GWs`; detail `50+ ${row.over50} · 70+ ${row.over70}`.
- `BenchTable` (`useBenchTable`): sort `b.benchTotal - a.benchTotal`; primary `${row.benchTotal}` label `Wasted`; detail `` `${row.efficiencyPct}% efficient · worst GW${row.worstEvent} (${row.worstPoints})` `` — when `row.worstEvent === 0` detail is `` `${row.efficiencyPct}% efficient` ``.
- `FormTable` (`useFormTable`): sort `b.formPoints - a.formPoints`; primary `${row.formPoints}` label `Last ${row.played}`; detail `W ${row.wins} · D ${row.draws} · L ${row.losses} · avg ${row.formAvg}`.
- `StreaksTable` (`useStreaksTable`): sortValue = hot → length, cold → −length, none → 0, sorted desc; primary hot `+${length}` / cold `-${length}` / none `0` label `Streak`; detail `hot ${row.longestHot} · cold ${row.longestCold}`.
- `VsWorldTable` (`useVsWorldTable`): sort `b.beatPct - a.beatPct || b.avgMargin - a.avgMargin`; primary `${row.beatPct}%` label `Vs World`; detail `beat ${row.beats}/${row.gwCount} · avg ${fmtSigned(row.avgMargin)}`; if every `row.gwCount === 0`, render `EmptyState` (import it) with title `Global Averages Unavailable`, message `FPL hasn't published gameweek averages yet.`.
- `TinkerTable` (`useTinkerTable`): sort `b.totalMoves - a.totalMoves`; primary `${row.totalMoves}` label `Moves`; detail `` `${row.avgPerGw}/gw · busiest GW${row.busiestEvent} (${row.busiestCount})` `` — when `busiestEvent === 0` detail `` `${row.avgPerGw}/gw` ``.
- `PaceTable` (`usePaceTable`): sort `b.projectedTotal - a.projectedTotal`; primary `${fmtPts(row.projectedTotal)}` label `Projected`; detail gap === 0 ? `` `${row.ppg} ppg · setting the pace` `` : `` `${row.ppg} ppg · ${row.gapToTopPace} off the pace` ``.

- [ ] **Step 2: Gates + commit** — `pnpm typecheck && pnpm check`, then `git add src/components/Tables && git commit -m "feat: add season stat views"`

---

### Task 10: RecordsBoard + RivalryGrid

**Files:**
- Create: `src/components/Stats/RecordsBoard.tsx`, `src/components/Stats/RivalryGrid.tsx`

**Interfaces:**
- Consumes: `useRecordsBoard`, `useRivalryGrid`, `LeagueStack`, `EmptyState`, `getLeagueLabel`-style names via `LEAGUE_IDS`/`LEAGUE_LABELS`.
- Produces: `RecordsBoard({ leagueIds })`, `RivalryGrid({ leagueIds })`.

- [ ] **Step 1: Implement `RecordsBoard.tsx`**

```tsx
"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { useRecordsBoard } from "@pbd/hooks/fpl/useRecordsBoard"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const RECORD_LABELS: Record<string, string> = {
  "biggest-margin": "Biggest Winning Margin",
  "closest-call": "Closest Call",
  "highest-week": "Highest League Week",
  "best-non-winner": "Best Losing Score",
  "lowest-winner": "Cheapest Win",
  "biggest-bench-waste": "Biggest Bench Waste",
}

const RECORD_UNITS: Record<string, string> = {
  "biggest-margin": "pt margin",
  "closest-call": "pt gap",
  "highest-week": "combined pts",
  "best-non-winner": "pts, no win",
  "lowest-winner": "pts, still won",
  "biggest-bench-waste": "pts benched",
}

export const RecordsBoard = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useRecordsBoard({ leagueIds })
  const showLeague = leagueIds.length > 1

  if (data.length === 0)
    return (
      <EmptyState
        title="No Records Yet"
        message="Records start landing once the first gameweek is complete."
      />
    )

  return (
    <div className="flex flex-col gap-2">
      {data.map((record) => {
        const leagueLabel =
          record.leagueId === LEAGUE_IDS.PREMIERSHIP
            ? LEAGUE_LABELS.premiership
            : LEAGUE_LABELS.championship
        const holderNames = record.holders.map((holder) => holder.managerName).join(" & ")
        const event = record.holders[0]?.event
        return (
          <div
            key={`${record.leagueId}-${record.key}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {RECORD_LABELS[record.key] ?? record.key}
              </p>
              <p className="truncate font-semibold text-foreground">
                {holderNames || leagueLabel}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {event ? `Gameweek ${event}` : "Whole league"}
                {showLeague && ` · ${leagueLabel}`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-black tabular-nums text-foreground">{record.value}</p>
              <p className="text-[10px] text-muted-foreground/60">{RECORD_UNITS[record.key]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Implement `RivalryGrid.tsx`**

```tsx
"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { useRivalryGrid } from "@pbd/hooks/fpl/useRivalryGrid"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const initials = (name: string): string => name.slice(0, 2).toUpperCase()

const cellClasses = (wins: number, losses: number): string => {
  if (wins > losses) return "bg-green-500/15 text-green-400"
  if (wins < losses) return "bg-red-500/15 text-red-400"
  return "bg-muted/40 text-muted-foreground"
}

export const RivalryGrid = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useRivalryGrid({ leagueIds })

  const grids = data.filter((grid) => grid.managers.length > 0)
  if (grids.length === 0)
    return (
      <EmptyState
        title="No Rivalries Yet"
        message="Head-to-head grids appear once the first gameweek is complete."
      />
    )

  return (
    <LeagueStack leagueIds={grids.map((grid) => grid.leagueId)} gap="loose">
      {(leagueId) => {
        const grid = grids.find((g) => g.leagueId === leagueId)
        if (!grid) return null
        const nameOf = (entryApiId: number): string =>
          grid.managers.find((m) => m.entryApiId === entryApiId)?.managerName ?? ""
        return (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {leagueId === LEAGUE_IDS.PREMIERSHIP
                ? LEAGUE_LABELS.premiership
                : LEAGUE_LABELS.championship}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3">
              <table className="w-full border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th aria-label="Manager" />
                    {grid.managers.map((manager) => (
                      <th
                        key={manager.entryApiId}
                        className="px-1 text-center text-[10px] font-bold uppercase text-muted-foreground"
                      >
                        {initials(manager.managerName)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.managers.map((manager, rowIndex) => (
                    <tr key={manager.entryApiId}>
                      <td className="max-w-20 truncate pr-1 text-xs font-semibold text-foreground">
                        {manager.managerName}
                      </td>
                      {grid.managers.map((opponent, colIndex) => {
                        const cell = grid.cells[rowIndex]?.[colIndex]
                        if (!cell || manager.entryApiId === opponent.entryApiId)
                          return (
                            <td
                              key={opponent.entryApiId}
                              className="h-8 min-w-8 rounded bg-muted/20"
                            />
                          )
                        return (
                          <td
                            key={opponent.entryApiId}
                            className={`h-8 min-w-8 rounded text-center text-[10px] font-bold tabular-nums ${cellClasses(cell.wins, cell.losses)}`}
                          >
                            {cell.wins}-{cell.losses}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-1">
              {grid.extremes.map((extreme) => (
                <p key={extreme.entryApiId} className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {nameOf(extreme.entryApiId)}
                  </span>
                  {extreme.nemesisApiId !== null && extreme.nemesisRecord && (
                    <>
                      {" — nemesis "}
                      {nameOf(extreme.nemesisApiId)} ({extreme.nemesisRecord.wins}-
                      {extreme.nemesisRecord.losses})
                    </>
                  )}
                  {extreme.bunnyApiId !== null && extreme.bunnyRecord && (
                    <>
                      {" · bunny "}
                      {nameOf(extreme.bunnyApiId)} ({extreme.bunnyRecord.wins}-
                      {extreme.bunnyRecord.losses})
                    </>
                  )}
                </p>
              ))}
            </div>
          </div>
        )
      }}
    </LeagueStack>
  )
}
```

- [ ] **Step 3: Gates + commit** — `pnpm typecheck && pnpm check`, then `git add src/components/Stats && git commit -m "feat: add records board and rivalry grid views"`

---

### Task 11: ManagerLineChart extraction + PointsRaceChart

**Files:**
- Create: `src/components/Stats/ManagerLineChart.tsx`, `src/components/Stats/PointsRaceChart.tsx`
- Modify: `src/components/Stats/PositionHistoryChart.tsx` (refactor onto the shared chart)

**Interfaces:**
- Produces: `ManagerLineSeries` (`entryApiId`, `managerName`, `points: { event: number; value: number | null }[]`), `ManagerLineChart({ series, yAxisLabel, reversed, yDomain, yTicks?, goatEntryId?, allowDecimals? })`, `PointsRaceChart({ leagueId })` plotting points-off-lead (leader = 0) from `usePositionHistory`.
- `PositionHistoryChart` keeps its exact public props (`{ leagueId }`) and visual behaviour: same colors, selection chips, end labels, 🐐 on the leader, reversed 1..N axis.

- [ ] **Step 1: Extract `ManagerLineChart`.** Move from `PositionHistoryChart` verbatim: `LINE_COLORS`, selection-chip state + toggle, `chartConfig`, chart-data pivot (events × series → rows keyed by `String(entryApiId)`), `lastIndexByParticipant`, the `<LineChart>` block with `XAxis` (gameweek ticks via `buildGameweekTicks`/`getGameweekAxisMax`), `YAxis` (configured from props), the `LabelList` end-label renderer, and the participants chip footer. Props drive: `reversed`, `yDomain: [number, number]`, `yTicks?: number[]`, `yAxisLabel: string`, `allowDecimals`, `goatEntryId`. The component receives `series` (already fetched) — it does no data fetching and renders no EmptyState (callers guard).

- [ ] **Step 2: Refactor `PositionHistoryChart`** to fetch via `usePositionHistory`, keep its EmptyState guard, compute `goatEntryId` (current leader logic unchanged), and render:

```tsx
<ManagerLineChart
  series={series}
  yAxisLabel="Position"
  reversed
  yDomain={[1, positionMax]}
  yTicks={positionTicks}
  goatEntryId={leaderId}
/>
```

where `series` maps `data` to `{ entryApiId, managerName, points: history.map((h) => ({ event: h.event, value: h.position > 0 ? h.position : null })) }`.

- [ ] **Step 3: Implement `PointsRaceChart`**

```tsx
"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ManagerLineChart } from "@pbd/components/Stats/ManagerLineChart"
import type { ManagerLineSeries } from "@pbd/components/Stats/ManagerLineChart"
import { usePositionHistory } from "@pbd/hooks/fpl/usePositionHistory"
import type { JSX } from "react"
import { useMemo } from "react"

type Props = {
  leagueId: number
}

export const PointsRaceChart = ({ leagueId }: Props): JSX.Element => {
  const { data } = usePositionHistory({ leagueIds: [leagueId] })

  const { series, minGap, leaderId } = useMemo(() => {
    const events = [...new Set(data.flatMap((d) => d.history.map((h) => h.event)))].sort(
      (a, b) => a - b,
    )
    const leaderTotals = new Map<number, number>()
    for (const event of events) {
      const totals = data.map(
        (d) => d.history.find((h) => h.event === event)?.totalPoints ?? 0,
      )
      leaderTotals.set(event, Math.max(...totals, 0))
    }
    const built: ManagerLineSeries[] = data.map((d) => ({
      entryApiId: d.entryApiId,
      managerName: d.managerName,
      points: events.map((event) => {
        const point = d.history.find((h) => h.event === event)
        const leader = leaderTotals.get(event) ?? 0
        return { event, value: point ? point.totalPoints - leader : null }
      }),
    }))
    const gaps = built.flatMap((s) => s.points.map((p) => p.value ?? 0))
    const lastEvent = events[events.length - 1]
    const leader =
      lastEvent === undefined
        ? null
        : (data.find(
            (d) =>
              (d.history.find((h) => h.event === lastEvent)?.totalPoints ?? -1) ===
              leaderTotals.get(lastEvent),
          )?.entryApiId ?? null)
    return { series: built, minGap: Math.min(...gaps, 0), leaderId: leader }
  }, [data])

  if (series.length === 0 || series.every((s) => s.points.length === 0))
    return (
      <EmptyState
        title="No Gameweeks Played"
        message="The points race starts plotting once Gameweek 1 is complete."
      />
    )

  return (
    <ManagerLineChart
      series={series}
      yAxisLabel="Points off lead"
      reversed={false}
      yDomain={[minGap, 0]}
      goatEntryId={leaderId}
      allowDecimals={false}
    />
  )
}
```

- [ ] **Step 4: Verify no regression** — `pnpm typecheck && pnpm check && pnpm build`, then in the wave-1 manual pass confirm the Standings chart looks unchanged.

- [ ] **Step 5: Commit** — `git add src/components/Stats && git commit -m "feat: add points race chart on a shared manager line chart"`

---

### Task 12: Wave-1 wiring — constants, navigation, StatView, Extra page

**Files:**
- Modify: `src/lib/constants/Stats.ts`, `src/lib/constants/Navigation.ts`, `src/components/Stats/StatView.tsx`, `src/components/Stats/StatViewSkeleton.tsx`, `src/app/extra/page.tsx`

**Interfaces:**
- Produces: 15 new slugs live (`points-race`, `form`, `all-play`, `luck`, `pace`, `streaks`, `records`, `vs-world`, `consistency`, `floor-ceiling`, `thresholds`, `bench`, `tinker`, `rivalries` — treatment arrives in wave 3), `STAT_GROUPS`, `buildStatTileGroups()`.

- [ ] **Step 1: Extend `Stats.ts`.** Add the 14 wave-1 slugs to `StatSlug` and `STAT_SLUGS` (keep existing order first, then: `points-race`, `form`, `all-play`, `luck`, `pace`, `streaks`, `records`, `vs-world`, `consistency`, `floor-ceiling`, `thresholds`, `bench`, `tinker`, `rivalries`). Extend `StatViewSpec`:

```ts
export type StatViewSpec =
  | { kind: "leaderboard"; type: "best" | "worst" }
  | { kind: "counts"; type: "relevancy" | "gw-wins" | "gw-losses" }
  | { kind: "waivers"; sortBy: "total" | "avg"; minGws?: number; maxGws?: number; limit?: number }
  | { kind: "trades"; sortBy: "total" | "avg"; minGws?: number }
  | { kind: "positionHistory" }
  | { kind: "pointsRace" }
  | { kind: "allPlay"; variant: "all-play" | "luck" }
  | { kind: "distribution"; variant: "consistency" | "floor-ceiling" | "thresholds" }
  | { kind: "bench" }
  | { kind: "form" }
  | { kind: "streaks" }
  | { kind: "vsWorld" }
  | { kind: "tinker" }
  | { kind: "pace" }
  | { kind: "records" }
  | { kind: "rivalry" }
```

New `STAT_VIEWS` entries: `"points-race": { kind: "pointsRace" }`, `"all-play": { kind: "allPlay", variant: "all-play" }`, `luck: { kind: "allPlay", variant: "luck" }`, `consistency: { kind: "distribution", variant: "consistency" }`, `"floor-ceiling": { kind: "distribution", variant: "floor-ceiling" }`, `thresholds: { kind: "distribution", variant: "thresholds" }`, `bench: { kind: "bench" }`, `form: { kind: "form" }`, `streaks: { kind: "streaks" }`, `"vs-world": { kind: "vsWorld" }`, `tinker: { kind: "tinker" }`, `pace: { kind: "pace" }`, `records: { kind: "records" }`, `rivalries: { kind: "rivalry" }`.

Labels (`STAT_LABELS` / `STAT_TILE_LABELS`): Points Race/Race, Form (Last 6)/Form, All-Play Table/All-Play, Luck Index/Luck, Title Pace/Pace, Hot & Cold Streaks/Streaks, Records Board/Records, Vs The World/Vs World, Consistency/Consistency, Floor & Ceiling/Floor–Ceiling, Threshold Clubs/60+ Club, Bench Points Wasted/Bench, Tinker Chart/Tinker, Rivalry Grid/Rivalries.

Add:

```ts
export type StatGroup = { key: string; label: string; slugs: StatSlug[] }

export const STAT_GROUPS: StatGroup[] = [
  {
    key: "race",
    label: "The Race",
    slugs: [
      "position-history",
      "points-race",
      "form",
      "all-play",
      "luck",
      "pace",
      "streaks",
      "records",
      "vs-world",
    ],
  },
  {
    key: "managers",
    label: "The Managers",
    slugs: [
      "best-gw",
      "worst-gw",
      "gw-wins",
      "gw-losses",
      "relevancy",
      "consistency",
      "floor-ceiling",
      "thresholds",
      "bench",
      "tinker",
    ],
  },
  { key: "rivalries", label: "The Rivalries", slugs: ["rivalries"] },
  {
    key: "market",
    label: "The Market",
    slugs: ["best-waivers", "best-waivers-avg", "one-week-wonders", "best-trades", "best-trades-ppg"],
  },
]
```

- [ ] **Step 2: Extend `Navigation.ts`.** Add icons/accents for the 14 slugs (every `Record<StatSlug, …>` must be exhaustive or `tsc` fails). Suggested icons — if any name doesn't exist in this lucide version, substitute from the verified set already imported (`Flame`, `Snowflake`, `Crown`, `Target`, …) and keep going: `points-race`: `Rocket`, `form`: `Activity`, `all-play`: `Network`, `luck`: `Clover`, `pace`: `Trophy`, `streaks`: `Zap`, `records`: `Star`, `vs-world`: `Globe`, `consistency`: `Ruler`, `floor-ceiling`: `ArrowUpDown`, `thresholds`: `BarChart3`, `bench`: `Armchair`, `tinker`: `Wrench`, `rivalries`: `Swords`. Accents (same `bg-<c>-500/15 text-<c>-400` pattern): rose, lime, sky, emerald, yellow, orange, amber, cyan, slate, violet, pink, stone, zinc, red — one each in that order.

Replace `buildStatTiles` with:

```ts
export type NavigationTileGroup = { heading: string; tiles: NavigationTile[] }

const statTile = (slug: StatSlug): NavigationTile => ({
  label: STAT_TILE_LABELS[slug],
  href: `/stats/${COMBINED_SCOPE}/${slug}`,
  icon: STAT_ICONS[slug],
  accent: STAT_ACCENTS[slug],
})

export const buildStatTileGroups = (): NavigationTileGroup[] =>
  STAT_GROUPS.map((group) => ({
    heading: group.label,
    tiles: group.slugs.map(statTile),
  }))
```

(import `STAT_GROUPS` and drop the now-unused `STAT_SLUGS` import; keep `buildPageTiles` untouched.)

- [ ] **Step 3: Update `src/app/extra/page.tsx`**

```tsx
import { NavigationCardGroup } from "@pbd/components/NavigationCards/NavigationCardGroup"
import { PageTitle } from "@pbd/components/PageTitle"
import { buildPageTiles, buildStatTileGroups } from "@pbd/lib/constants/Navigation"
import type { Metadata } from "next"
import type { JSX } from "react"

const PAGE_TITLE = "Extra"

export const metadata: Metadata = { title: PAGE_TITLE }

const ExtraPage = (): JSX.Element => (
  <div className="flex flex-col gap-6">
    <PageTitle title={PAGE_TITLE} />
    <NavigationCardGroup heading="Pages" tiles={buildPageTiles()} />
    {buildStatTileGroups().map((group) => (
      <NavigationCardGroup key={group.heading} heading={group.heading} tiles={group.tiles} />
    ))}
  </div>
)

export default ExtraPage
```

- [ ] **Step 4: Extend `StatView.tsx`** — new imports + switch cases:

```tsx
    case "pointsRace":
      return (
        <LeagueStack leagueIds={leagueIds} gap="loose">
          {(leagueId) => <PointsRaceChart leagueId={leagueId} />}
        </LeagueStack>
      )
    case "allPlay":
      return <AllPlayTable leagueIds={leagueIds} variant={spec.variant} />
    case "distribution":
      return <ScoreDistributionTable leagueIds={leagueIds} variant={spec.variant} />
    case "bench":
      return <BenchTable leagueIds={leagueIds} />
    case "form":
      return <FormTable leagueIds={leagueIds} />
    case "streaks":
      return <StreaksTable leagueIds={leagueIds} />
    case "vsWorld":
      return <VsWorldTable leagueIds={leagueIds} />
    case "tinker":
      return <TinkerTable leagueIds={leagueIds} />
    case "pace":
      return <PaceTable leagueIds={leagueIds} />
    case "records":
      return <RecordsBoard leagueIds={leagueIds} />
    case "rivalry":
      return <RivalryGrid leagueIds={leagueIds} />
```

- [ ] **Step 5: Extend `StatViewSkeleton.tsx`** — chart kinds and grids:

```tsx
const CHART_KINDS = new Set(["positionHistory", "pointsRace"])

const rowCount = (spec: StatViewSpec, leagueIds: number[]): number => {
  if (spec.kind === "counts") return countParticipants(leagueIds)
  if (spec.kind === "waivers") return spec.limit ?? STAT_TABLE_ROW_LIMIT
  if (
    spec.kind === "allPlay" ||
    spec.kind === "distribution" ||
    spec.kind === "bench" ||
    spec.kind === "form" ||
    spec.kind === "streaks" ||
    spec.kind === "vsWorld" ||
    spec.kind === "tinker" ||
    spec.kind === "pace" ||
    spec.kind === "rivalry"
  )
    return countParticipants(leagueIds)
  if (spec.kind === "records") return RECORD_SKELETON_ROWS

  return STAT_TABLE_ROW_LIMIT
}
```

with `const RECORD_SKELETON_ROWS = 6` and the early return switched to `if (!CHART_KINDS.has(spec.kind)) return <TableSkeleton …>`.

- [ ] **Step 6: Full gates** — `pnpm test && pnpm typecheck && pnpm check && pnpm build`.

- [ ] **Step 7: Manual pass** — `pnpm dev`, open `/extra` (grouped tiles), then each new stat page under `/stats/combined/<slug>` and at least one under `/stats/premiership/<slug>`; confirm Standings chart unchanged; confirm PlayerDetails opens from ManagerStatList rows.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: wire wave-one stats into grouped extras navigation"`

---

### Task 13: Draft value lib

**Files:**
- Create: `src/lib/fpl/draftValue.ts`
- Test: `src/lib/fpl/draftValue.test.ts`

**Interfaces:**
- Produces: `DraftPickInput` (`leagueId`, `round`, `pickNumber`, `entryApiId`, `elementId`, `seasonPoints`, `draftRank`), `computeDraftGrades` → `{ entryApiId; leagueId; totalPoints; avgPoints; bestPickElementId: number | null }[]`, `computeDraftValue` → input + `{ pointsRank; valueScore }` (valueScore = pickNumber − pointsRank, positive = steal), `computeRoundWinners` → `{ leagueId; round; pick: DraftPickInput }[]`, `computeReachRows` → input + `{ reachDelta }` (draftRank − pickNumber, positive = reach).

- [ ] **Step 1: Write failing tests**

```ts
import {
  computeDraftGrades,
  computeDraftValue,
  computeReachRows,
  computeRoundWinners,
} from "@pbd/lib/fpl/draftValue"
import { describe, expect, it } from "vitest"

const pick = (
  pickNumber: number,
  entryApiId: number,
  elementId: number,
  seasonPoints: number,
  draftRank: number,
  leagueId = 10,
) => ({
  leagueId,
  round: Math.ceil(pickNumber / 2),
  pickNumber,
  entryApiId,
  elementId,
  seasonPoints,
  draftRank,
})

describe("computeDraftGrades", () => {
  it("totals and averages each manager's draft class", () => {
    const grades = computeDraftGrades([
      pick(1, 1, 101, 100, 1),
      pick(2, 2, 102, 40, 2),
      pick(3, 2, 103, 60, 3),
      pick(4, 1, 104, 10, 4),
    ])

    expect(grades.find((g) => g.entryApiId === 1)).toMatchObject({
      totalPoints: 110,
      avgPoints: 55,
      bestPickElementId: 101,
    })
  })
})

describe("computeDraftValue", () => {
  it("scores late picks that outscore the board as steals", () => {
    const rows = computeDraftValue([
      pick(1, 1, 101, 20, 1),
      pick(2, 2, 102, 90, 2),
      pick(3, 1, 103, 50, 3),
    ])

    const steal = rows.find((r) => r.elementId === 102)
    expect(steal?.pointsRank).toBe(1)
    expect(steal?.valueScore).toBe(1)
    const bust = rows.find((r) => r.elementId === 101)
    expect(bust?.valueScore).toBe(-2)
  })

  it("ranks points within each league separately", () => {
    const rows = computeDraftValue([pick(1, 1, 101, 10, 1, 10), pick(1, 9, 201, 5, 1, 20)])

    expect(rows.find((r) => r.elementId === 201)?.pointsRank).toBe(1)
  })
})

describe("computeRoundWinners", () => {
  it("picks the highest scorer of each round per league", () => {
    const winners = computeRoundWinners([
      pick(1, 1, 101, 30, 1),
      pick(2, 2, 102, 80, 2),
      pick(3, 1, 103, 70, 3),
      pick(4, 2, 104, 20, 4),
    ])

    expect(winners.find((w) => w.round === 1)?.pick.elementId).toBe(102)
    expect(winners.find((w) => w.round === 2)?.pick.elementId).toBe(103)
  })
})

describe("computeReachRows", () => {
  it("marks players taken ahead of their official rank as reaches", () => {
    const rows = computeReachRows([pick(5, 1, 101, 0, 40), pick(100, 2, 102, 0, 20)])

    expect(rows.find((r) => r.elementId === 101)?.reachDelta).toBe(35)
    expect(rows.find((r) => r.elementId === 102)?.reachDelta).toBe(-80)
  })
})
```

- [ ] **Step 2: Run to fail**, **Step 3: Implement** (group by league; `pointsRank` by seasonPoints desc tie-broken by pickNumber asc then elementId asc; grades tie-break bestPick by seasonPoints desc; round winners tie-break lower pickNumber; reach rows sorted reachDelta desc), **Step 4: green + gates**, **Step 5: commit** `feat: add draft value derivations`.

```ts
import { round1 } from "@pbd/lib/utils/fmt"

export type DraftPickInput = {
  leagueId: number
  round: number
  pickNumber: number
  entryApiId: number
  elementId: number
  seasonPoints: number
  draftRank: number
}

export type DraftGrade = {
  entryApiId: number
  leagueId: number
  totalPoints: number
  avgPoints: number
  bestPickElementId: number | null
}

export type DraftValueRow = DraftPickInput & { pointsRank: number; valueScore: number }

export type DraftRoundWinner = { leagueId: number; round: number; pick: DraftPickInput }

export type DraftReachRow = DraftPickInput & { reachDelta: number }

const byLeague = (picks: DraftPickInput[]): Map<number, DraftPickInput[]> => {
  const groups = new Map<number, DraftPickInput[]>()
  for (const pick of picks) {
    const group = groups.get(pick.leagueId) ?? []
    group.push(pick)
    groups.set(pick.leagueId, group)
  }
  return groups
}

export const computeDraftGrades = (picks: DraftPickInput[]): DraftGrade[] => {
  const byEntry = new Map<string, DraftPickInput[]>()
  for (const pick of picks) {
    const key = `${pick.leagueId}-${pick.entryApiId}`
    const group = byEntry.get(key) ?? []
    group.push(pick)
    byEntry.set(key, group)
  }
  return [...byEntry.values()].map((group) => {
    const first = group[0]
    const totalPoints = group.reduce((sum, pick) => sum + pick.seasonPoints, 0)
    const best = [...group].sort(
      (a, b) => b.seasonPoints - a.seasonPoints || a.pickNumber - b.pickNumber,
    )[0]
    return {
      entryApiId: first?.entryApiId ?? 0,
      leagueId: first?.leagueId ?? 0,
      totalPoints,
      avgPoints: group.length === 0 ? 0 : round1(totalPoints / group.length),
      bestPickElementId: best ? best.elementId : null,
    }
  })
}

export const computeDraftValue = (picks: DraftPickInput[]): DraftValueRow[] => {
  const rows: DraftValueRow[] = []
  for (const group of byLeague(picks).values()) {
    const ranked = [...group].sort(
      (a, b) =>
        b.seasonPoints - a.seasonPoints || a.pickNumber - b.pickNumber || a.elementId - b.elementId,
    )
    const rankByElement = new Map(ranked.map((pick, index) => [pick.elementId, index + 1]))
    for (const pick of group) {
      const pointsRank = rankByElement.get(pick.elementId) ?? 0
      rows.push({ ...pick, pointsRank, valueScore: pick.pickNumber - pointsRank })
    }
  }
  return rows
}

export const computeRoundWinners = (picks: DraftPickInput[]): DraftRoundWinner[] => {
  const winners: DraftRoundWinner[] = []
  for (const [leagueId, group] of byLeague(picks)) {
    const rounds = new Map<number, DraftPickInput>()
    for (const pick of group) {
      const current = rounds.get(pick.round)
      if (
        !current ||
        pick.seasonPoints > current.seasonPoints ||
        (pick.seasonPoints === current.seasonPoints && pick.pickNumber < current.pickNumber)
      )
        rounds.set(pick.round, pick)
    }
    for (const [round, pick] of rounds) winners.push({ leagueId, round, pick })
  }
  return winners.sort((a, b) => a.leagueId - b.leagueId || a.round - b.round)
}

export const computeReachRows = (picks: DraftPickInput[]): DraftReachRow[] =>
  picks
    .map((pick) => ({ ...pick, reachDelta: pick.draftRank - pick.pickNumber }))
    .sort((a, b) => b.reachDelta - a.reachDelta)
```

---

### Task 14: Draft board procedure + views + wiring

**Files:**
- Create: `src/server/routers/fpl/draftStats.ts`, `src/hooks/fpl/useDraftBoard.ts`, `src/components/Tables/DraftBoardView.tsx`
- Modify: `src/server/routers/fpl.ts`, `src/hooks/fpl/fpl.cache.ts`, `src/lib/constants/Stats.ts`, `src/lib/constants/Navigation.ts`, `src/components/Stats/StatView.tsx`, `src/components/Stats/StatViewSkeleton.tsx`

**Interfaces:**
- Produces: procedure `draftBoard { leagueIds }` → `{ picks: (DraftPickInput & { managerName; teamName; playerName; playerTeam; positionType })[] }`; component `DraftBoardView({ leagueIds, variant: "grades" | "steals" | "busts" | "rounds" | "reach" })`; slugs `draft-grades`, `draft-steals`, `draft-busts`, `draft-rounds`, `draft-reach` under new group `{ key: "draft", label: "The Draft" }` inserted between the rivalries and market groups.

- [ ] **Step 0: Probe the choices payload semantics** (decides two mappings):

```bash
curl -sS -A "Mozilla/5.0" 'https://draft.premierleague.com/api/draft/4683/choices' | python3 -c "
import json,sys; d=json.load(sys.stdin)
c=d['choices']; print(len(c)); print([{k:x[k] for k in ('round','pick','index','entry','entry_name')} for x in c[:10]])
print('element_status sample:', d['element_status'][:3])"
```

Decision table: if `choices[8]` (9th pick) has `pick === 9`, `pick` is the overall number — use it directly as `pickNumber`; if `pick` resets per round, use `index` if global, else `pickNumber = (round - 1) * teamCount + pick`. If `entry` values match `PARTICIPANTS` `apiId`s (19445…), resolve names via `PARTICIPANT_BY_API_ID` and use `entry` as `entryApiId`; if they match `entryId`s (19435…), resolve via `PARTICIPANT_BY_ENTRY_ID` and set `entryApiId` from the participant. Same check for `element_status.owner` (needed in Task 16).

- [ ] **Step 1: Implement `draftStats.ts`** — fetch `fetchLeagueDraftChoices` per league + bootstrap; build picks with `seasonPoints = element.total_points`, `draftRank = element.draft_rank`, `playerName = element.web_name`, `playerTeam` via team short-name map, `positionType = element.element_type`; skip choices whose element is missing from bootstrap. Register `...draftStatsProcedures` in `fpl.ts`. Add `draftBoardOptions` (FRESHNESS.gameweek) + `useDraftBoard` hook (Task 7 template).

- [ ] **Step 2: Implement `DraftBoardView.tsx`** — single hook + variant rendering:
  - `grades`: `computeDraftGrades(picks)` → `ManagerStatList` (sort totalPoints desc; primary `fmtPts(totalPoints)` label `Draft Pts`; detail `avg ${avgPoints} · best ${playerName of bestPickElementId}`).
  - `steals`: `computeDraftValue(picks)` sorted valueScore desc, top `STAT_TABLE_ROW_LIMIT`, player-row cards in the BestWaiversTable visual style: rank badge index, playerName + playerTeam, `manager · R${round} P${pickNumber}` line, right value `fmtSigned(valueScore)` label `Value`.
  - `busts`: same rows sorted valueScore asc.
  - `rounds`: `computeRoundWinners(picks)` grouped headers `Round ${round}` (league chip when combined), row per league-round with playerName, manager, `fmtPts(seasonPoints)`.
  - `reach`: `computeReachRows(picks)` top rows, right value `fmtSigned(reachDelta)` label `Reach`.

- [ ] **Step 3: Wire constants** — add the 5 slugs to `StatSlug`/`STAT_SLUGS`/labels (Draft Grades/Grades, Draft Steals/Steals, Draft Busts/Busts, Round Winners/Rounds, Reach Index/Reach), spec kind `{ kind: "draft"; variant: … }`, `STAT_VIEWS` entries, icons (`draft-grades`: `GraduationCap`, `draft-steals`: `Gem`, `draft-busts`: `Skull`, `draft-rounds`: `Layers`, `draft-reach`: `Telescope` — same substitution rule), accents (indigo, fuchsia, red, teal, purple), group `{ key: "draft", label: "The Draft", slugs: [...] }` before market, StatView case `"draft"` → `<DraftBoardView leagueIds={leagueIds} variant={spec.variant} />`, skeleton: `draft` → `STAT_TABLE_ROW_LIMIT` rows (grades variant renders fewer — acceptable).

- [ ] **Step 4: Gates + manual pass** — `pnpm test && pnpm typecheck && pnpm check && pnpm build`; dev-check all five `/stats/combined/draft-*` pages.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add draft retrospective stats"`

---

### Task 15: Market libs (gotAway, marketCounts, freeAgentXi)

**Files:**
- Create: `src/lib/fpl/gotAway.ts` + test, `src/lib/fpl/marketCounts.ts` + test, `src/lib/fpl/freeAgentXi.ts` + test

**Interfaces:**
- `gotAway.ts`: `GotAwayDrop` (`elementId`, `entryId`, `droppedEvent`), `collectDrops(transactions)` (accepted `w`/`f` only), `findReacquisitionEvent(drop, transactions): number | null`, `sumPointsSince(drop, reacquiredEvent, gwPoints: Map<number, number>, finishedEvents: number[]): { pointsSince; gwsSince }` (window = droppedEvent … reacquiredEvent − 1, finished events only).
- `marketCounts.ts`: `MarketCount` (`elementId`, `count`), `countAddedElements(txs, limit)`, `countDroppedElements(txs, limit)` (both accepted-only), `countWantedElements(txs, limit)` (all `w` claims, any result); sorted count desc, elementId asc.
- `freeAgentXi.ts`: `XiCandidate` (`elementId`, `webName`, `teamShort`, `positionType`, `seasonPoints`), `computeFreeAgentXi(candidates): { formation: string; totalPoints: number; players: XiCandidate[] } | null` over legal formations `[[3,4,3],[3,5,2],[4,3,3],[4,4,2],[4,5,1],[5,2,3],[5,3,2],[5,4,1]]` + 1 GK; null when no legal XI exists.

- [ ] **Step 1: Write failing tests** (key cases):

```ts
describe("collectDrops", () => {
  it("collects only accepted waiver and free-agent drops", () => { /* result "a" vs "di", kind "w"/"f" */ })
})

describe("findReacquisitionEvent", () => {
  it("returns the event the same manager re-added the player", () => { /* later element_in match */ })
  it("returns null when the player never came back", () => {})
})

describe("sumPointsSince", () => {
  it("sums finished gameweeks from the drop until the reacquisition", () => {
    const result = sumPointsSince(
      { elementId: 7, entryId: 1, droppedEvent: 3 },
      6,
      new Map([
        [3, 10],
        [4, 2],
        [5, 8],
        [6, 99],
      ]),
      [3, 4, 5, 6],
    )

    expect(result).toEqual({ pointsSince: 20, gwsSince: 3 })
  })
  it("ignores unfinished gameweeks", () => {})
})

describe("countWantedElements", () => {
  it("counts rejected waiver claims too", () => {})
  it("breaks count ties by element id", () => {})
})

describe("computeFreeAgentXi", () => {
  it("picks the highest-scoring legal formation", () => { /* points force 3-4-3 vs 4-4-2 */ })
  it("returns null when there is no goalkeeper", () => {})
  it("skips formations the candidate pool cannot fill", () => {})
})
```

- [ ] **Step 2–4: Implement to green** (implementations as specified in the spec/interfaces above; `computeFreeAgentXi` sorts each position desc by points tie-broken by elementId, slices per formation, requires exact counts, keeps the best total; `sumPointsSince` end = `reacquiredEvent === null ? Infinity : reacquiredEvent - 1`).

- [ ] **Step 5: Commit** — `git add src/lib/fpl && git commit -m "feat: add market derivation libs"`

---

### Task 16: Market + treatment procedures, worst waivers

**Files:**
- Create: `src/server/routers/fpl/marketStats.ts`
- Modify: `src/server/routers/fpl.ts`, `src/server/routers/fpl/stats.ts` (bestWaivers direction), `src/hooks/fpl/fpl.cache.ts`, plus hooks `useGotAway.ts`, `useMarketReport.ts`, `useFreeAgentXi.ts`, `useTreatmentTable.ts`

**Interfaces:**
- `gotAway { leagueIds }` → rows `{ elementId, playerName, playerTeam, entryApiId, leagueId, managerName, teamName, droppedEvent, gwsSince, pointsSince }` sorted pointsSince desc, sliced to `STAT_TABLE_ROW_LIMIT`, built from transactions + `collectDrops`/`findReacquisitionEvent`/`sumPointsSince` + `fetchFplSafe` element summaries for unique dropped elements (mirror the `bestWaivers` summary-fan pattern; manager names via `PARTICIPANT_BY_ENTRY_ID`, `entryApiId` from the participant).
- `marketReport { leagueIds }` → `{ mostAdded, mostDropped, mostWanted }`, each `{ elementId, playerName, playerTeam, count }[]` (limit 10) via marketCounts + bootstrap enrichment.
- `freeAgentXi { leagueIds }` → per league `{ leagueId, xi: FreeAgentXi | null }` — candidates = bootstrap elements whose `element_status.owner === null` (id space per Task 14 probe) and `removed === false`.
- `treatmentTable { leagueIds }` → per entry `{ entryApiId, leagueId, managerName, teamName, flaggedCount, worstFlags: { webName, status, chance: number | null }[] }` — owned squads from `element_status.owner`, flagged = element `status !== "a"`, worstFlags top 3 by `chance_of_playing_next_round` asc with null first.
- `bestWaivers` input gains `direction: z.enum(["best", "worst"]).default("best")`; `"worst"` inverts both sort branches (asc).

- [ ] **Step 1: Implement `marketStats.ts`** with the four procedures (same imports/patterns as `stats.ts`: `fetchLeagueTransactions`, `fetchLeagueDraftChoices`, bootstrap, `fetchFplSafe` summaries). Register `...marketStatsProcedures` in `fpl.ts`.

- [ ] **Step 2: `stats.ts` surgical edit** — add `direction` to the `bestWaivers` zod input and change the final sort to:

```ts
      const orderedByDirection = (a: number, b: number): number =>
        input.direction === "worst" ? a - b : b - a
      const sorted =
        input.sortBy === "avg"
          ? filtered.sort((a, b) => orderedByDirection(a.avgPoints, b.avgPoints))
          : filtered.sort((a, b) => orderedByDirection(a.points, b.points))
```

- [ ] **Step 3: Options + hooks** — `gotAwayOptions`, `marketReportOptions`, `freeAgentXiOptions`, `treatmentTableOptions` (all `FRESHNESS.gameweek`) + the four hook files (Task 7 template).

- [ ] **Step 4: Gates + commit** — `pnpm test && pnpm typecheck && pnpm check`, `git add -A && git commit -m "feat: add market and treatment procedures with waiver direction"`

---

### Task 17: PitchSurface + market views + wiring

**Files:**
- Create: `src/components/Pitch/PitchSurface.tsx`, `src/components/Tables/GotAwayTable.tsx`, `src/components/Stats/MarketReportView.tsx`, `src/components/Stats/FreeAgentXiView.tsx`, `src/components/Tables/TreatmentTable.tsx`
- Modify: `src/components/Modals/PlayerDetails/SquadView.tsx` (refactor onto PitchSurface), `src/components/Tables/BestWaiversTable.tsx` (direction prop), `src/lib/constants/Stats.ts`, `src/lib/constants/Navigation.ts`, `src/components/Stats/StatView.tsx`, `src/components/Stats/StatViewSkeleton.tsx`

**Interfaces:**
- `PitchSurface({ rows, bench? })` where `rows: { key: string; players: { key: string; name: string; value: string; muted?: boolean; flag?: "amber" | "red" }[] }[]` — renders the striped pitch (background gradient, halfway line, centre circle from today's SquadView) with a name+value chip per player and an optional bench strip; SquadView maps picks/live into it with identical visual output.
- `GotAwayTable({ leagueIds })`, `MarketReportView({ leagueIds })` (three sections: Most Added / Most Dropped / Most Wanted), `FreeAgentXiView({ leagueIds })` (LeagueStack → PitchSurface with formation + total header, EmptyState when `xi === null`), `TreatmentTable({ leagueIds })` (ManagerStatList: primary flaggedCount label `Flagged`, detail from worstFlags like `Saka 50% · Rice inj · Timber 25%`, chance null → status letter map `{ i: "inj", s: "susp", u: "out", d: "doubt", n: "na" }`).
- New slugs: `worst-waivers` (`{ kind: "waivers", sortBy: "total", direction: "worst", minGws: 3 }` — extend the waivers spec type with `direction?: "best" | "worst"` and thread through `StatView` → `BestWaiversTable` → hook input), `got-away` (`{ kind: "gotAway" }`), `market-report` (`{ kind: "marketReport" }`), `free-agent-xi` (`{ kind: "freeAgentXi" }`), `treatment` (`{ kind: "treatment" }`).
- Labels: Worst Waivers/Flops, The Ones That Got Away/Got Away, Market Report/Market, Free Agent XI/FA XI, Treatment Table/Treatment. Icons: `TrendingDown`, `Ghost`, `Newspaper`, `Shirt`, `Stethoscope` (substitution rule applies). Accents: blue, neutral `bg-gray-500/15 text-gray-400`, green, lime, rose. Groups: `treatment` appends to the managers group; the other four append to the market group.

- [ ] **Step 1: Extract PitchSurface + refactor SquadView** — visual parity check in the dialog afterwards.
- [ ] **Step 2: Build the four views** (GotAwayTable rows mirror BestWaiversTable card layout: player name + team, `dropped by ${managerName} · GW${droppedEvent}` line, right `fmtPts(pointsSince)` label `Since`).
- [ ] **Step 3: Wire constants/StatView/skeleton** (worst-waivers skeleton reuses the waivers branch; gotAway/marketReport → `STAT_TABLE_ROW_LIMIT`; freeAgentXi → chart-ish block, use `TableSkeleton` rows = 11; treatment → participants count).
- [ ] **Step 4: Gates + manual pass over the five new pages + the squad dialog** — `pnpm test && pnpm typecheck && pnpm check && pnpm build`.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add market stats, treatment table and free agent pitch"`

---

### Task 18: Squad view extras + final verification

**Files:**
- Modify: `src/components/Modals/PlayerDetails/SquadView.tsx`

**Interfaces:**
- Availability flag per player chip: bootstrap `status !== "a"` → `flag: "amber"` when `status === "d"` and `(chance_of_playing_next_round ?? 0) >= 50`, else `"red"` (PitchSurface renders a small corner dot).
- Season strip under the bench: four cells — `Squad pts` (Σ `total_points`), `xGI Δ` (Σ (`goals_scored + assists`) − Σ `parseFloat(expected_goal_involvements)`, `fmtSigned(round1(…))`), `DC pts` (Σ `defensive_contribution`), `Flagged` (count of non-`"a"` statuses) — computed over the 15 picks from data the view already has.

- [ ] **Step 1: Implement flags + strip.**
- [ ] **Step 2: Full verification** — `pnpm test && pnpm typecheck && pnpm check && pnpm build`; dev pass over `/extra`, one stat per group, squad dialog from a stat row.
- [ ] **Step 3: Commit + push** — `git add -A && git commit -m "feat: add availability flags and season strip to squad view"`, then `git push -u origin feature/stats-scraping`.
