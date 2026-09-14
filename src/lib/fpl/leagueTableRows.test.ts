import { LEAGUE_IDS } from "@pbd/lib/constants/Fpl"
import { buildLeagueTableRows, countGameweeksPlayed } from "@pbd/lib/fpl/leagueTableRows"
import type { LeagueDetailsResponse, LeagueEntry, Standing } from "@pbd/types/fpl.types"
import { describe, expect, it } from "vitest"

const SMYFFLER_API_ID = 19445
const WAN_API_ID = 19446
const TEECE_API_ID = 19447
const PETE_API_ID = 19452

const standing = (overrides: Partial<Standing> & Pick<Standing, "league_entry">): Standing => ({
  event_total: 0,
  last_rank: 0,
  rank: 1,
  rank_sort: 1,
  total: 0,
  ...overrides,
})

const entry = (id: number, teamName: string): LeagueEntry =>
  ({ id, entry_name: teamName }) as LeagueEntry

const league = (
  leagueId: number,
  standings: Standing[],
  entries: LeagueEntry[] = [],
): LeagueDetailsResponse =>
  ({
    league: { id: leagueId },
    league_entries: entries,
    standings,
  }) as unknown as LeagueDetailsResponse

type BuildOverrides = Partial<Parameters<typeof buildLeagueTableRows>[0]>

const build = (leagues: LeagueDetailsResponse[], overrides: BuildOverrides = {}) =>
  buildLeagueTableRows({
    leagues,
    mode: "form",
    gameweeksPlayed: 1,
    toPlayMap: {},
    returnsMap: {},
    pointsMap: {},
    ...overrides,
  })

describe("buildLeagueTableRows", () => {
  it("ranks both leagues as one field on gameweek score", () => {
    const rows = build([
      league(LEAGUE_IDS.PREMIERSHIP, [
        standing({ league_entry: SMYFFLER_API_ID, event_total: 41 }),
        standing({ league_entry: WAN_API_ID, event_total: 66 }),
      ]),
      league(LEAGUE_IDS.CHAMPIONSHIP, [
        standing({ league_entry: TEECE_API_ID, event_total: 58 }),
        standing({ league_entry: PETE_API_ID, event_total: 72 }),
      ]),
    ])

    expect(rows.map((row) => row.leagueEntryId)).toEqual([
      PETE_API_ID,
      WAN_API_ID,
      TEECE_API_ID,
      SMYFFLER_API_ID,
    ])
    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3, 4])
  })

  it("keeps each row pointing at the league its manager plays in", () => {
    const rows = build([
      league(LEAGUE_IDS.PREMIERSHIP, [standing({ league_entry: SMYFFLER_API_ID })]),
      league(LEAGUE_IDS.CHAMPIONSHIP, [standing({ league_entry: PETE_API_ID })]),
    ])

    const leagueIdFor = (apiId: number) => rows.find((row) => row.leagueEntryId === apiId)?.leagueId

    expect(leagueIdFor(SMYFFLER_API_ID)).toBe(LEAGUE_IDS.PREMIERSHIP)
    expect(leagueIdFor(PETE_API_ID)).toBe(LEAGUE_IDS.CHAMPIONSHIP)
  })

  it("falls back to live points while the official gameweek total is still zero", () => {
    const rows = build(
      [
        league(LEAGUE_IDS.PREMIERSHIP, [standing({ league_entry: SMYFFLER_API_ID })]),
        league(LEAGUE_IDS.CHAMPIONSHIP, [standing({ league_entry: PETE_API_ID })]),
      ],
      { pointsMap: { [SMYFFLER_API_ID]: 34, [PETE_API_ID]: 12 } },
    )

    expect(rows.map((row) => row.leagueEntryId)).toEqual([SMYFFLER_API_ID, PETE_API_ID])
    expect(rows.map((row) => row.gameweekScore)).toEqual([34, 12])
  })

  it("breaks a cross-league gameweek tie on goals scored", () => {
    const rows = build(
      [
        league(LEAGUE_IDS.PREMIERSHIP, [
          standing({ league_entry: SMYFFLER_API_ID, event_total: 55 }),
        ]),
        league(LEAGUE_IDS.CHAMPIONSHIP, [standing({ league_entry: PETE_API_ID, event_total: 55 })]),
      ],
      {
        returnsMap: {
          [SMYFFLER_API_ID]: { goals: 1, assists: 3 },
          [PETE_API_ID]: { goals: 4, assists: 0 },
        },
      },
    )

    expect(rows.map((row) => row.leagueEntryId)).toEqual([PETE_API_ID, SMYFFLER_API_ID])
  })

  it("shows no movement arrows on a merged gameweek table", () => {
    const rows = build([
      league(LEAGUE_IDS.PREMIERSHIP, [
        standing({ league_entry: SMYFFLER_API_ID, rank: 4, last_rank: 2 }),
      ]),
      league(LEAGUE_IDS.CHAMPIONSHIP, [standing({ league_entry: PETE_API_ID, rank: 1 })]),
    ])

    expect(rows.every((row) => row.lastRank === 0)).toBe(true)
  })

  it("keeps a single league's official ranks and movement on the season table", () => {
    const rows = build(
      [
        league(LEAGUE_IDS.PREMIERSHIP, [
          standing({ league_entry: SMYFFLER_API_ID, rank: 1, last_rank: 1, total: 700 }),
          standing({ league_entry: WAN_API_ID, rank: 2, last_rank: 5, total: 640 }),
        ]),
      ],
      { mode: "total" },
    )

    expect(rows.map((row) => row.rank)).toEqual([1, 2])
    expect(rows.map((row) => row.lastRank)).toEqual([1, 5])
  })

  it("ranks the merged season table on total points", () => {
    const rows = build(
      [
        league(LEAGUE_IDS.PREMIERSHIP, [
          standing({ league_entry: SMYFFLER_API_ID, rank: 1, last_rank: 1, total: 640 }),
        ]),
        league(LEAGUE_IDS.CHAMPIONSHIP, [
          standing({ league_entry: PETE_API_ID, rank: 1, last_rank: 3, total: 700 }),
        ]),
      ],
      { mode: "total" },
    )

    expect(rows.map((row) => row.leagueEntryId)).toEqual([PETE_API_ID, SMYFFLER_API_ID])
    expect(rows.map((row) => row.rank)).toEqual([1, 2])
    expect(rows.map((row) => row.lastRank)).toEqual([0, 0])
  })

  it("reads team names and to-play counts for every league in the table", () => {
    const rows = build(
      [
        league(
          LEAGUE_IDS.PREMIERSHIP,
          [standing({ league_entry: SMYFFLER_API_ID })],
          [entry(SMYFFLER_API_ID, "Smyffler FC")],
        ),
        league(
          LEAGUE_IDS.CHAMPIONSHIP,
          [standing({ league_entry: PETE_API_ID })],
          [entry(PETE_API_ID, "Pete United")],
        ),
      ],
      { toPlayMap: { [PETE_API_ID]: 3 } },
    )

    expect(rows.map((row) => row.teamName)).toEqual(["Smyffler FC", "Pete United"])
    expect(rows.map((row) => row.toPlay)).toEqual([0, 3])
  })

  it("averages a season total across the gameweeks played", () => {
    const rows = build(
      [league(LEAGUE_IDS.PREMIERSHIP, [standing({ league_entry: SMYFFLER_API_ID, total: 300 })])],
      { mode: "total", gameweeksPlayed: 6 },
    )

    expect(rows[0]?.averagePoints).toBe(50)
  })

  it("reports a zero average before any gameweek has been played", () => {
    const rows = build(
      [league(LEAGUE_IDS.PREMIERSHIP, [standing({ league_entry: SMYFFLER_API_ID, total: 0 })])],
      { mode: "total", gameweeksPlayed: 0 },
    )

    expect(rows[0]?.averagePoints).toBe(0)
  })
})

describe("countGameweeksPlayed", () => {
  it("counts the current gameweek as played", () => {
    expect(countGameweeksPlayed(5, 1)).toBe(5)
  })

  it("offsets by a league that joins the season late", () => {
    expect(countGameweeksPlayed(10, 4)).toBe(7)
  })

  it("returns zero before the season starts", () => {
    expect(countGameweeksPlayed(null, 1)).toBe(0)
  })

  it("returns zero when the league starts after the current gameweek", () => {
    expect(countGameweeksPlayed(2, 6)).toBe(0)
  })
})
