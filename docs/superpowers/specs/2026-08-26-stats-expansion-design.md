# Stats Library Expansion — Design

Date: 2026-08-26
Branch: `feature/stats-scraping`
Status: built, then trimmed in a same-day user review — the plan's
"Post-review changes" section is the source of truth for what actually shipped
(24 stat pages plus 5 record award cards; floor-ceiling, tinker, treatment, the
draft group and market report were built and then removed; records moved into
Awards; bench points are computed from picks and live data because the API field
is always zero)

## Goal

Grow the Extra → Stats library from 11 stats to 35 by adding 24 new stats, all derived
from FPL Draft API endpoints the app already calls. Group the stats tiles under
subheadings on the Extra page. Enrich the player-dialog squad view with data already
fetched by that view. Keep the existing UI language (card-row lists, RankBadge,
PlayerDetails dialog, LeagueStack, skeletons that match content).

Reference catalogue: https://claude.ai/code/artifact/3ff8a99a-2843-46ac-8c7f-5b1899940153

## Non-goals (explicitly out of scope)

- No new FPL endpoints. No historical picks fan-out, no per-GW live sweeps.
- No Monte Carlo simulation, no simulated-H2H schedule distribution.
- No waiver hit rate, net-gain breakdown table, draft loyalty, MVP/dependency,
  points-by-position/club, auto-sub rescues, dreamteam counts, xG-luck tables
  (these need picks/live fan-out — future waves).
- No changes to Awards, Picks, Transactions, Gameweek, Home, or league tables.
- No theming changes.

## Constraints & facts the design relies on

- Both leagues are classic-scoring draft leagues (`scoring: "c"`); there are no H2H
  matches. H2H-flavoured stats are computed all-play/pairwise from per-GW points.
- Verified live API fields not yet in our types:
  `EntryHistoryEvent.points_on_bench`, `EntryHistoryEvent.event_transfers`,
  `FplElement.draft_rank`. These get added to `fpl.types.ts`.
- Already typed and unused: `ElementStatus.owner` (from `draftChoices`),
  `FplElement` xG/DC/status fields. (`FplEvent.average_entry_score` turned out to be
  always `null` in the draft API — the Vs The World stat was cut during execution;
  see the plan's Deviations section.)
- League scoping: stat pages take a scope (`premiership` | `championship` |
  `combined`); procedures receive `leagueIds: number[]`. Within-league calculations
  key by `${leagueId}-${event}` (existing `gwCountsTable` precedent), then rows merge
  into one ranked list for combined scope.
- Only finished events count (`bootstrap.events.data[].finished`), matching every
  existing stat procedure.

## Architecture

```
lib/fpl/*.ts            pure derivation (client-safe, co-located vitest tests)
server/fpl/seasonScores.ts   shared assembler: league details + entry histories + bootstrap
server/routers/fpl/seasonStats.ts   history-based procedures
server/routers/fpl/draftStats.ts    draft board procedure
server/routers/fpl/marketStats.ts   got-away / market report / free-agent XI / treatment
hooks/fpl/use*.ts       one suspense hook per procedure, options in fpl.cache.ts
components/Tables/*     view components mapping rows → shared ManagerStatList
components/Stats/*      charts, records board, rivalry grid
lib/constants/Stats.ts  slugs, labels, view specs, STAT_GROUPS
lib/constants/Navigation.ts  icons, accents, grouped tile builder
```

### Shared assembler — `server/fpl/seasonScores.ts`

`fetchSeasonScores(leagueIds)` composes `fetchLeagueDetails` per league,
`entryHistory` per entry (existing TTL cache), and `bootstrap-static`. Returns:

```ts
type SeasonScores = {
  finishedEvents: number[]
  averageByEvent: { event: number; average: number }[]
  stopEvent: number
  entries: {
    entryApiId: number
    leagueId: number
    managerName: string
    teamName: string
    rows: { event: number; points: number; totalPoints: number; pointsOnBench: number; eventTransfers: number }[]
  }[]
}
```

Manager names resolve via `PARTICIPANT_BY_API_ID` with the existing fallback chain.
Every seasonStats procedure starts from this one call, so per-request fetch shape is
identical to today's stats procedures.

### Pure lib modules (all TDD, co-located tests)

- `lib/fpl/allPlay.ts` — per-league per-event comparisons.
  `computeAllPlayRecords(entries, finishedEvents)` → wins/draws/losses/winPct per entry.
  `computePairwiseRecords(entries, finishedEvents)` → per ordered pair {wins, draws, losses}.
  `computeLuck(actualRanks, allPlayRanks)` → `luckDelta = allPlayRank − actualRank`
  (positive = the total-points table flatters you).
- `lib/fpl/scoreDistribution.ts` — mean, population stdDev, interpolated percentile
  (p10/p90), threshold counts (50+/60+/70+).
- `lib/fpl/streaks.ts` — per-event league median (mean of two middle values for even
  field sizes); hot = points > median, cold = points < median, equal breaks both;
  returns current streak {type, length} and longest hot/cold.
- `lib/fpl/records.ts` — per league: biggest GW winning margin (top vs runner-up),
  closest top-two, highest combined league week, best score that didn't top its GW,
  lowest GW-topping score, biggest single-GW bench waste. Ties → multiple holders.
- `lib/fpl/draftValue.ts` — given enriched picks (round, overall pick, entry, element,
  seasonPoints, draftRank): grades per entry (total + per-pick avg), round winners,
  value ranking for steals/busts (seasonPoints rank vs pick order), reach delta
  (official `draft_rank` vs overall pick number).
- `lib/fpl/gotAway.ts` — waiver/free-agent drops (`result === "a"`), window from drop
  event until the same entry re-acquires the element (else current event), summing
  element GW points over finished events in the window.
- `lib/fpl/freeAgentXi.ts` — best legal XI from unowned elements
  (`element_status.owner === null`): try every legal FPL formation
  (1 GK; 3–5 DEF; 2–5 MID; 1–3 FWD; 10 outfielders), take positional top-N by season
  points, return the max-total formation.
- `lib/fpl/marketCounts.ts` — most added (accepted), most dropped, most wanted
  (all waiver claims incl. rejected) from transactions.

### Procedures

`seasonStats.ts` (all input `{ leagueIds }` via existing `leagueIdsInput` unless noted):

| Procedure | Row payload (per entry, plus rank/meta) |
|---|---|
| `allPlayTable` | wins, draws, losses, winPct, actualRank, luckDelta |
| `scoreDistributionTable` | avg, stdDev, floor (p10), ceiling (p90), over50, over60, over70 |
| `benchTable` | benchTotal, benchAvg, worstEvent, worstPoints, efficiencyPct |
| `formTable` | formPoints, formAvg, wins/draws/losses over last 6 finished events |
| `streaksTable` | current {type, length}, longestHot, longestCold |
| `vsWorldTable` | beats, gwCount, beatPct, avgMargin (mean of points − `average_entry_score` over finished events) |
| `tinkerTable` | totalMoves, avgPerGw, busiestEvent, busiestCount |
| `paceTable` | ppg, projectedTotal (ppg × stopEvent), gapToTopPace (top projectedTotal − own projectedTotal) |
| `recordsBoard` | list of {key, label, value, holders[{managerName, teamName, entryApiId, event}], leagueId} |
| `rivalryGrid` | per league: managers[] + cells[][] {wins, draws, losses} + per-manager nemesis/bunny |

`draftStats.ts`:

| Procedure | Payload |
|---|---|
| `draftBoard` | all picks: leagueId, round, pickNumber, entryApiId, managerName, teamName, elementId, playerName, playerTeam, positionType, seasonPoints, draftRank |

The five draft views aggregate `draftBoard` rows client-side through
`lib/fpl/draftValue.ts` (pure, shared, tested). ~240 rows over the wire.

`marketStats.ts`:

| Procedure | Payload |
|---|---|
| `gotAway` | top drops: playerName, playerTeam, droppedByManager, teamName, entryApiId, leagueId, droppedEvent, gwsSince, pointsSince |
| `marketReport` | mostAdded[], mostDropped[], mostWanted[] as {elementId, playerName, playerTeam, count} |
| `freeAgentXi` | per league: formation label, players[{elementId, webName, teamShort, positionType, seasonPoints}], totalPoints |
| `treatmentTable` | per entry: flaggedCount, worstFlags[{webName, status, chance}] from owned squads (`element_status.owner`) + bootstrap availability |

`stats.ts` (surgical change): `bestWaivers` gains `direction: "best" | "worst"`
(default `"best"`); `"worst"` sorts ascending. Worst Waivers uses `minGws: 3`.

Points Race needs no procedure — the existing `positionHistory` payload already carries
`totalPoints` per event; a new chart renders gap-to-leader from it.

### Client

- `components/Tables/ManagerStatList.tsx` — the shared renderer for every
  manager-ranked stat: rows {rank, entryApiId, leagueId, managerName, teamName,
  primary {value, label}, detail?}. Mirrors `GwCountsTable` visuals (RankBadge,
  card rows, PlayerDetails dialog on tap). `GwCountsTable` itself is left untouched.
- One thin view component per procedure family (single hook each):
  `AllPlayTable` (variant `all-play` | `luck`), `ScoreDistributionTable`
  (variant `consistency` | `floor-ceiling` | `thresholds`, client-side sort+rank),
  `BenchTable`, `FormTable`, `StreaksTable`, `VsWorldTable`, `TinkerTable`,
  `PaceTable`, `TreatmentTable`.
- `components/Stats/RecordsBoard.tsx` — record cards (label, holder, value, GW,
  league chip when combined).
- `components/Stats/RivalryGrid.tsx` — per-league grid via LeagueStack; row = manager,
  cell = W-L vs column manager, tinted by lead/trail; nemesis & bunny lines beneath;
  `overflow-x-auto` container.
- `components/Stats/PointsRaceChart.tsx` — recharts line chart of gap-to-leader per
  league via LeagueStack, reusing PositionHistoryChart's axis/tooltip conventions.
- Draft views: `DraftGradesTable` (→ ManagerStatList), `DraftValueTable`
  (variant `steals` | `busts` | `reach`), `DraftRoundsView` — player-row styling
  follows BestWaiversTable.
- Market views: `WorstWaivers` reuses `BestWaiversTable` with direction prop;
  `GotAwayTable`, `MarketReportView`, `FreeAgentXiView`.
- `components/Pitch/PitchSurface.tsx` — extract the pitch background + row layout
  from SquadView so FreeAgentXiView reuses it; SquadView refactors onto it.
- Hooks: one per procedure in `hooks/fpl/`, options factories in `fpl.cache.ts`
  (`FRESHNESS.gameweek`).
- `StatView` gains the new kinds; `StatViewSkeleton` maps: charts → ChartSkeleton,
  manager tables → TableSkeleton(countParticipants), player/record lists →
  TableSkeleton(STAT_TABLE_ROW_LIMIT), grid → TableSkeleton(countParticipants).

### Stats constants & navigation

New `StatSlug`s (24): `points-race`, `form`, `all-play`, `luck`, `pace`, `streaks`,
`records`, `vs-world`, `consistency`, `floor-ceiling`, `thresholds`, `bench`,
`tinker`, `treatment`, `rivalries`, `draft-grades`, `draft-steals`, `draft-busts`,
`draft-rounds`, `draft-reach`, `worst-waivers`, `got-away`, `market-report`,
`free-agent-xi`.

`STAT_GROUPS: { key, label, slugs }[]`:

| Group | Slugs |
|---|---|
| The Race | position-history, points-race, form, all-play, luck, pace, streaks, records, vs-world |
| The Managers | best-gw, worst-gw, gw-wins, gw-losses, relevancy, consistency, floor-ceiling, thresholds, bench, tinker, treatment |
| The Rivalries | rivalries |
| The Draft | draft-grades, draft-steals, draft-busts, draft-rounds, draft-reach |
| The Market | best-waivers, best-waivers-avg, one-week-wonders, best-trades, best-trades-ppg, worst-waivers, got-away, market-report, free-agent-xi |

Every slug keeps entries in `STAT_LABELS`, `STAT_TILE_LABELS`, `STAT_VIEWS`,
`STAT_ICONS`, `STAT_ACCENTS` (Record types make omissions compile errors).
`buildStatTiles` becomes `buildStatTileGroups(): { heading, tiles }[]`; the Extra page
renders one `NavigationCardGroup` per stat group under the existing "Stats" area,
headed by the group label. The `/stats/[league]` redirect stays as-is.

### Squad view extras (player dialog)

Using only data SquadView already loads (bootstrap + picks + live):

- Availability dot on each player chip when `status !== "a"`
  (amber for doubtful 25–75%, red for injured/suspended/unavailable).
- A season strip under the bench: squad season points, squad xGI vs actual G+A delta,
  squad DC points, flagged-player count.

## Edge cases

- **One finished GW (current state):** every stat renders with n=1 — stdDev 0,
  streaks of length 1, form window = min(6, played), records computed over one week.
- **Zero finished GWs:** manager tables render the existing `EmptyState` pattern
  ("fills in once the first gameweek is complete"). Draft views still render
  (season points all 0). Free Agent XI renders (season points 0).
- **Ties:** all-play equal scores are draws; records with equal values list every
  holder; ranks assign by sorted order (stable by manager name for determinism).
- **Combined scope:** within-league math, merged ranked rows (existing precedent);
  RivalryGrid and FreeAgentXi render one block per league via LeagueStack.
- **Failed fetches:** the assembler mirrors the existing stat procedures — league
  details degrade to empty via `fetchLeagueDetails`, entry-history fetches use
  `fetchFpl` and throw to the page's `DataErrorBoundary` ("Stat Unavailable").

## Testing & verification

- Vitest (TDD) for every `lib/fpl/*` module: allPlay (records, pairwise, luck sign),
  scoreDistribution (percentile interpolation, single-sample), streaks (median ties,
  breaks), records (ties, single-GW), draftValue (grades, steals/busts ordering,
  reach sign), gotAway (re-acquisition window, unfinished GWs excluded),
  freeAgentXi (formation legality, max total), marketCounts.
- Procedures stay thin orchestration (fetch → lib → shape), matching the repo's
  existing untested-router convention.
- Per wave: `pnpm test`, `pnpm typecheck`, `pnpm check`, `pnpm build`, plus a manual
  dev-server pass over new stat pages in both scopes.

## Build waves

1. **Foundation + Race/Managers/Rivalries** — types, seasonScores assembler,
   allPlay/scoreDistribution/streaks/records libs + tests, seasonStats router,
   ManagerStatList, eight view components, RecordsBoard, RivalryGrid, PointsRaceChart,
   constants/navigation/skeleton wiring, grouped Extra page.
2. **Draft** — draftBoard procedure, draftValue lib + tests, draft views, slugs wired.
3. **Market + Treatment** — bestWaivers direction, gotAway/marketReport/freeAgentXi/
   treatmentTable procedures + libs + tests, PitchSurface extraction, views, slugs
   wired (treatment tile joins the Managers group).
4. **Squad view extras** — availability dots + season strip in SquadView.

Each wave ends green (test/typecheck/check/build) and committed. Wave 1 is the bulk;
waves 2–4 are additive.
