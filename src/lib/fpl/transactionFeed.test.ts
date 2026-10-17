import { buildTransactionFeed } from "@pbd/lib/fpl/transactionFeed"
import type { LeagueEntry, Standing, Transaction } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const GAMEWEEK = 7

const FIRST_PLACE_ENTRY_ID = 101
const SECOND_PLACE_ENTRY_ID = 102
const THIRD_PLACE_ENTRY_ID = 103
const UNRANKED_ENTRY_ID = 104

const leagueEntry = (id: number, entryId: number): LeagueEntry =>
  ({
    id,
    entry_id: entryId,
    entry_name: `Team ${entryId}`,
    player_first_name: "Manager",
    player_last_name: String(entryId),
  }) as LeagueEntry

const standing = (leagueEntryId: number, rankSort: number): Standing => ({
  event_total: 0,
  last_rank: 0,
  league_entry: leagueEntryId,
  rank: rankSort,
  rank_sort: rankSort,
  total: 0,
})

const waivers = (entryId: number, count: number): Transaction[] =>
  Array.from({ length: count }, (_, index) => ({
    added: `2026-10-0${index + 1}T10:00:00Z`,
    element_in: entryId * 10 + index,
    element_out: entryId * 100 + index,
    entry: entryId,
    event: GAMEWEEK,
    id: entryId * 1000 + index,
    index: null,
    kind: "w",
    priority: null,
    result: "a",
    note: null,
  }))

const LEAGUE_ENTRIES = [
  leagueEntry(1, FIRST_PLACE_ENTRY_ID),
  leagueEntry(2, SECOND_PLACE_ENTRY_ID),
  leagueEntry(3, THIRD_PLACE_ENTRY_ID),
  leagueEntry(4, UNRANKED_ENTRY_ID),
]

const STANDINGS = [standing(1, 1), standing(2, 2), standing(3, 3)]

const managerOrder = (transactions: Transaction[]): number[] =>
  (
    buildTransactionFeed({
      transactions,
      trades: [],
      elements: [],
      teams: [],
      leagueEntries: LEAGUE_ENTRIES,
      standings: STANDINGS,
    }).movesByGameweek.get(GAMEWEEK) ?? []
  ).map((group) => group.entryId)

describe("buildTransactionFeed", () => {
  it("lists managers from the bottom of the league to the top, ignoring how many moves each made", () => {
    const transactions = [
      ...waivers(FIRST_PLACE_ENTRY_ID, 3),
      ...waivers(SECOND_PLACE_ENTRY_ID, 2),
      ...waivers(THIRD_PLACE_ENTRY_ID, 1),
    ]

    const order = managerOrder(transactions)

    expect(order).toEqual([THIRD_PLACE_ENTRY_ID, SECOND_PLACE_ENTRY_ID, FIRST_PLACE_ENTRY_ID])
  })

  it("lists a manager missing from the standings below the ranked managers", () => {
    const transactions = [...waivers(UNRANKED_ENTRY_ID, 4), ...waivers(SECOND_PLACE_ENTRY_ID, 1)]

    const order = managerOrder(transactions)

    expect(order).toEqual([SECOND_PLACE_ENTRY_ID, UNRANKED_ENTRY_ID])
  })
})
