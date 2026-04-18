export const LEAGUE_IDS = {
  PREMIERSHIP: 1069,
  CHAMPIONSHIP: 32779,
} as const;

export type LeagueSlug = "premiership" | "championship";

export const LEAGUE_SLUG_TO_ID: Record<LeagueSlug, number> = {
  premiership: LEAGUE_IDS.PREMIERSHIP,
  championship: LEAGUE_IDS.CHAMPIONSHIP,
};

export const LEAGUE_LABELS: Record<LeagueSlug, string> = {
  premiership: "Premiership",
  championship: "Championship",
};

export const IS_VALID_LEAGUE_SLUG = (slug: string): slug is LeagueSlug =>
  slug === "premiership" || slug === "championship";

const FPL_DRAFT_BASE = "https://draft.premierleague.com/api";

export const FPL_ENDPOINTS = {
  leagueDetails: (id: number) => `${FPL_DRAFT_BASE}/league/${id}/details`,
  draftChoices: (id: number) => `${FPL_DRAFT_BASE}/draft/${id}/choices`,
  transactions: (id: number) =>
    `${FPL_DRAFT_BASE}/draft/league/${id}/transactions`,
  trades: (id: number) => `${FPL_DRAFT_BASE}/draft/league/${id}/trades`,
  bootstrapStatic: () => `${FPL_DRAFT_BASE}/bootstrap-static`,
  entryHistory: (entryId: number) =>
    `${FPL_DRAFT_BASE}/entry/${entryId}/history`,
  entryEventPicks: (entryId: number, eventId: number) =>
    `${FPL_DRAFT_BASE}/entry/${entryId}/event/${eventId}`,
  elementSummary: (elementId: number) =>
    `${FPL_DRAFT_BASE}/element-summary/${elementId}`,
  eventLive: (eventId: number) => `${FPL_DRAFT_BASE}/event/${eventId}/live`,
} as const;

export const CACHE_TTL = {
  STANDINGS: 900, // 15 min — updates a few times on match days
  DRAFT_CHOICES: 2592000, // 30 days — locked for the season
  TRANSACTIONS: 259200, // 3 days — waivers run once a week
  TRADES: 259200, // 3 days — trades are infrequent
  BOOTSTRAP: 2592000, // 30 days
  ENTRY_HISTORY: 259200, // 3 days — GW scores only change during match weekends
  ENTRY_EVENT_PICKS: 259200, // 3 days — past GW picks are immutable once complete
  ELEMENT_SUMMARY: 259200, // 3 days — historical GW scores are immutable
  EVENT_LIVE: 90, // 90 sec — live match stats
} as const;

export const NAV_SECTIONS = [
  "home",
  "leagues",
  "stats",
  "awards",
  "picks",
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

export const NAV_LABELS: Record<NavSection, string> = {
  home: "Home",
  leagues: "Leagues",
  stats: "Stats",
  awards: "Awards",
  picks: "Picks",
};

export const PICKS_DISPLAY_COUNT = 120 as const;

export const POSITION_LABELS: Record<number, string> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
};

export const POSITION_COLORS: Record<number, string> = {
  1: "bg-amber-500/20 text-amber-400",
  2: "bg-sky-500/20 text-sky-400",
  3: "bg-emerald-500/20 text-emerald-400",
  4: "bg-rose-500/20 text-rose-400",
};
