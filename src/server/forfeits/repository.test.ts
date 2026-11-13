import { listForfeits } from "@pbd/server/forfeits/repository"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { query } = vi.hoisted(() => ({
  query: vi.fn<(text: string, params: unknown[]) => Promise<unknown[]>>(),
}))

vi.mock("@pbd/server/db", () => ({ getSql: () => ({ query }) }))

const WEEKLY_FILTERS = {
  league: null,
  cadence: "weekly" as const,
  gameweek: null,
  type: null,
  subType: null,
  person: null,
}

const GAMEWEEK_ORDER = "(case when gameweek = 'annual' then 39 else gameweek::int end)"

const LIST_ORDER = `season, ${GAMEWEEK_ORDER}, date_trunc('milliseconds', created_at), id`

const CURSOR = {
  season: "2026/27",
  gameweek: "10",
  createdAt: "2026-11-08T08:00:00.000Z",
  id: "0b6f2c1e-1111-4222-8333-444455556666",
}

const lastQuery = (): { text: string; params: unknown[] } => {
  const call = query.mock.lastCall
  if (!call) throw new Error("listForfeits did not run a query")

  const [text, params] = call
  return { text, params }
}

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue([])
})

describe("listForfeits", () => {
  it("lists the newest season first, then the highest gameweek, then the latest upload", async () => {
    await listForfeits(WEEKLY_FILTERS, null, 13)

    expect(lastQuery().text).toContain(
      `order by season desc, ${GAMEWEEK_ORDER} desc, date_trunc('milliseconds', created_at) desc, id desc limit $2`,
    )
    expect(lastQuery().params).toEqual(["annual", 13])
  })

  it("seeks past the cursor on the same keys the list is sorted by", async () => {
    await listForfeits(WEEKLY_FILTERS, CURSOR, 13)

    expect(lastQuery().text).toContain(
      `(${LIST_ORDER}) < ($2::text, (case when $3::text = 'annual' then 39 else $3::text::int end), $4::timestamptz, $5::uuid)`,
    )
    expect(lastQuery().params).toEqual([
      "annual",
      CURSOR.season,
      CURSOR.gameweek,
      CURSOR.createdAt,
      CURSOR.id,
      13,
    ])
  })

  it("numbers every filter placeholder in the order its value is bound", async () => {
    await listForfeits(
      { ...WEEKLY_FILTERS, league: "premiership", gameweek: "3", person: "rory-sproule" },
      CURSOR,
      13,
    )

    const { text, params } = lastQuery()
    expect(text).toContain("where league = $1 and gameweek = $2 and person = $3 and (")
    expect(text).toContain("limit $8")
    expect(params).toEqual([
      "premiership",
      "3",
      "rory-sproule",
      CURSOR.season,
      CURSOR.gameweek,
      CURSOR.createdAt,
      CURSOR.id,
      13,
    ])
  })
})
