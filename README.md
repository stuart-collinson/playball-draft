# Playball Draft

A live dashboard for a private **Fantasy Premier League Draft** competition — two eight-team
leagues (Premiership and Championship) tracked across a season.

The official FPL Draft site shows you one league table and little else. This app is the layer on
top: combined standings across both divisions, per-gameweek winners and losers, season awards,
squad and pick inspection, waiver and trade analysis, and position-history charts — all refreshing
on their own while matches are in play.

It is **read-only**. There is no login, no database, and no admin panel. Every figure on screen is
derived at request time from the public FPL Draft API, so there is no state to keep in sync and
nothing to back up.

## What it does

| Route | What you get |
| --- | --- |
| `/home` | Current gameweek at a glance — winner, loser, live scores, season countdown out of season |
| `/leagues/[league]` | Full standings for one division |
| `/leagues/combined` | Both divisions merged into a single table |
| `/stats/[league]` | Best/worst gameweeks, waiver and trade leaderboards, one-week wonders, relevancy |
| `/awards/[league]` | Season-long awards |
| `/picks/[league]` | Who owns whom, with squad and player detail modals |
| `/form/[league]` | Recent-form view over the last few gameweeks |

## Architecture

The whole design answers one question: **how do you show near-live scores without hammering a
third-party API you don't control?**

The answer is a two-layer cache with a shared clock, so the app's request volume tracks what is
actually happening on the pitch rather than how many people have a tab open.

```
draft.premierleague.com  (public API, no key)
        │
        │   Layer 1 — Next.js Data Cache
        │   per-endpoint TTLs, shared by every visitor
        ▼
   tRPC procedures  (server-only, typed end to end)
        │
        │   RSC prefetch → dehydrate → hydrate
        ▼
   TanStack Query  (Layer 2 — per browser)
        │
        │   staleTime + poll interval, both chosen by game phase
        ▼
   React components
```

### Layer 1 — the server cache is the shield

Every outbound fetch goes through one file, `src/server/fpl/client.ts`, which attaches a browser
`User-Agent` (FPL's WAF rejects datacenter traffic that doesn't look like a browser) and a
`next: { revalidate }` TTL drawn from a single `SERVER_TTL` map.

Because it is Next's Data Cache, the TTL is **shared across all users**. A hundred people watching
a live gameweek generate the same upstream load as one. Each endpoint gets its own constant so the
same URL is never fetched under two different TTLs — live scores at 10s, current-gameweek picks at
5m (locked at the deadline, so they can't change), finalised picks at 6h, draft choices at 1h.

### Layer 2 — the client cache follows the game

The client half is driven by a **game phase** derived from the live fixture list
(`src/lib/fpl/gamePhase.ts`):

| Phase | Meaning |
| --- | --- |
| `live` | At least one fixture has started and hasn't settled |
| `imminent` | Kickoff within 30 minutes, or a match finished in the last 2 hours |
| `break` | Fixtures scheduled, none near |
| `idle` | Nothing left unstarted |

A single lightweight `gameState` query acts as a **heartbeat**. It polls itself at a rate set by
the phase it last reported — 30s when live or imminent, 5m during a break, 15m when idle — so the
app costs almost nothing on a Tuesday in July and tightens up on a Saturday afternoon.

That phase then feeds two things: how long data stays fresh (`FRESHNESS` tiers of `live`,
`matchDay`, `gameweek`, `stable` — 5 seconds through to 6 hours) and whether live queries poll at
all (`LIVE_POLL_INTERVALS` — 10s live, 60s imminent, **off** during a break or idle). Polling stops
completely when there is no football on.

### Rendering

Pages are React Server Components and deliberately thin. Each one validates its route slug,
prefetches **exactly** the queries the page will render, and hands off:

```tsx
const queryClient = getQueryClient()

void Promise.all([
  queryClient.prefetchQuery(api.fpl.gameState.queryOptions()),
  queryClient.prefetchQuery(api.fpl.leagueDetails.queryOptions({ leagueId })),
])

return (
  <HydrateClient>
    <Suspense fallback={<TableSkeleton />}>
      <LeagueTable leagueId={leagueId} mode="total" />
    </Suspense>
  </HydrateClient>
)
```

The prefetch is deliberately *not* awaited — the shell streams immediately and each panel resolves
into its skeleton. "Exactly what it renders" is a real constraint: modal-only data (transactions,
draft choices, per-entry history) is left to load on demand, because a modal may never be opened.

## How it's put together

**Stack.** Next.js 15 (App Router) · React 19 · TypeScript 5.7 · tRPC 11 · TanStack Query 5 ·
Tailwind CSS 4 · Radix UI · Recharts · Motion · Zustand · Zod · Biome · Vitest · pnpm.

**Typed end to end, no codegen.** tRPC procedures live in `src/server/routers/fpl/`, split by
concern (`game`, `league`, `live`, `entries`, `stats`, `awards`, `bootstrap`). Types flow from
procedure to component automatically; Zod validates every procedure input.

**One place per decision.** Server TTLs live only in `SERVER_TTL`. Client freshness lives only in
`FRESHNESS`. Query options are assembled once per endpoint in `src/hooks/fpl/fpl.cache.ts`, so a
page and its prefetch can never disagree about a cache key, and retuning a tier is a one-line
change.

**Server state vs client state are kept apart.** Anything from the API lives in the TanStack cache
and is never copied into a store. Zustand holds only genuine UI state — the selected stat in
`statsStore`, modal and layout flags in `uiStore`.

**Layout.** `src/app` routes · `src/components` (one folder per component; `ui/` holds the
shadcn-style primitives) · `src/hooks/fpl` one hook per query · `src/lib` pure logic, no React ·
`src/server` server-only · `src/types` shared types. Imports use the `@pbd/*` alias for `./src/*`;
relative paths are avoided.

**Tests** cover the pure logic where the rules actually bite — phase derivation, freshness
invariants, chart axis maths, ownership and rank calculations. Run with Vitest.

**No comments.** This is a no-comment-first codebase; see `CLAUDE.md`. Rationale belongs in commit
messages and in this file, not scattered through source.

**Zero configuration.** There are no environment variables. The FPL Draft API needs no key, there
is no database and no auth, so a clone runs with nothing but `pnpm install`. The one optional knob
is `FPL_LOG_CACHE=0`, which silences the edge-cache header logging used to tune the server TTLs.

## Running it locally

Requires **Node 20+** and **pnpm 9+**.

```bash
git clone https://github.com/stuart-collinson/playball-draft.git
cd playball-draft
pnpm install
pnpm dev
```

Open <http://localhost:3000>. No `.env` file is needed — if it starts, it works.

Other commands:

```bash
pnpm build       # production build
pnpm start       # serve the production build
pnpm test        # Vitest
pnpm typecheck   # tsc --noEmit
pnpm check       # Biome lint + format check
pnpm format      # Biome format --write
```

Deployment is Vercel with no configuration: connect the repo and it builds. Nothing to set in
project settings, and no GitHub Actions secrets.

## Making it your own

The app is pointed at one specific competition. There is no settings screen, so making it yours
means editing config in source — but most of it is genuinely just data.

**What's free.** The number of managers is entirely dynamic. Nothing anywhere assumes eight per
league, or sixteen in total — `PARTICIPANTS` is a plain array and every lookup and standings table
is derived from whatever is in it. Six managers, twelve, twenty, and uneven divisions all work with
no code change. Names, nicknames, photos and league labels are likewise pure data.

**What's shaped.** The app is currently built around **two** leagues. That one is structural rather
than a constant you can bump — see below.

### 1. League IDs

`src/lib/constants/fpl.ts`:

```ts
export const LEAGUE_IDS = {
  PREMIERSHIP: 1069,
  CHAMPIONSHIP: 32779,
} as const
```

Find yours by opening your league on `draft.premierleague.com` — the URL contains the ID.

Alongside it in the same file, `LEAGUE_LABELS` sets the display names, `LEAGUE_SLUG_TO_ID` sets the
URL slugs, and `LeagueSlug` types them. Renaming divisions means updating the `LeagueSlug` union,
both records, and the `IS_VALID_LEAGUE_SLUG` guard together — rename them all or TypeScript will
tell you which you missed.

**Running one league** is the easy case: point both constants at the same ID and give both slugs
the same label. The combined view becomes redundant but nothing breaks.

**Running three or more** is a small refactor rather than a config edit. Two leagues is assumed in
four known places, and each wants to become a loop over a list:

| File | What assumes two |
| --- | --- |
| `src/lib/constants/fpl.ts` | `LEAGUE_IDS` keys and the `LeagueSlug` union |
| `src/hooks/fpl/useBothLeagueDetails.ts` | Calls `useLeagueDetails` once per named league |
| `src/app/leagues/combined/page.tsx` | Prefetches both leagues explicitly |
| `scripts/sync-participants.mjs` | Guards on exactly two arguments |

None of it is hard — the data layer underneath is already keyed by `leagueId`, so it is mostly a
matter of turning named pairs into iteration over a `LEAGUE_IDS` array. A contained change, not a
rewrite.

### 2. Participants — names, nicknames and photos

`src/lib/constants/participants.ts` is one entry per manager:

```ts
{
  apiId: 3096,
  entryId: 3096,
  leagueId: LEAGUE_IDS.PREMIERSHIP,
  name: "Lewis Smyth",
  nickname: "Smyffler",
  image: "/participants/lewis_smyth.jpg",
}
```

- `apiId` — the manager's `LeagueEntry.id`, used by the standings and league-details endpoints.
- `entryId` — their `entry_id`, used by the draft-choices endpoint. Often the same number, **not
  always**, so don't assume.
- `nickname` — what the UI shows instead of their real name. Set `null` to fall back to `name`.
- `image` — a path under `public/`. Set `null` and the UI degrades to a placeholder: a single
  initial in the player-detail modal, a plain circle elsewhere.

Photos live in `public/participants/` — one per manager, however many you have (16 today, named
`first_last.jpg`). Replace them with your own and update each `image` path to match. The filenames
are convention only: nothing scans the directory, so any name works as long as the config points
at it, and managers without a photo are fine.

Add as many entries as your leagues have. The array length is never assumed anywhere.

Three lookup maps (`PARTICIPANT_BY_API_ID`, `PARTICIPANT_BY_ENTRY_ID`, `PARTICIPANTS_BY_LEAGUE_ID`)
are derived from the array automatically. You never edit those.

### 3. Regenerating participants each season

FPL Draft issues **new league and entry IDs every season**, so last year's numbers point at
strangers once your leagues are recreated and drafted. A script rebuilds the array from live data:

```bash
pnpm sync:participants <premiershipLeagueId> <championshipLeagueId>
```

It prints a ready-made `PARTICIPANTS` array to stdout — paste it over the existing one — while
progress and warnings go to stderr, so you can redirect cleanly:

```bash
pnpm sync:participants 1069 32779 > /tmp/participants.txt
```

It carries over each person's `nickname` and `image` by matching on `name`, so your hand-maintained
fields survive. It also tells you who is new (no nickname or photo yet) and who has left. Run it
**after** your leagues have been created and drafted — before the draft the API returns no entries,
and the script will say so.

Then update `LEAGUE_IDS` to the new IDs, add photos for anyone new, and you're set for the season.
