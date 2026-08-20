export const LEAGUE_IDS = {
  PREMIERSHIP: 1069,
  CHAMPIONSHIP: 32779,
} as const

export type LeagueSlug = "premiership" | "championship"

export const LEAGUE_SLUGS: LeagueSlug[] = ["premiership", "championship"]

export const LEAGUE_SLUG_TO_ID: Record<LeagueSlug, number> = {
  premiership: LEAGUE_IDS.PREMIERSHIP,
  championship: LEAGUE_IDS.CHAMPIONSHIP,
}

export const LEAGUE_LABELS: Record<LeagueSlug, string> = {
  premiership: "Premiership",
  championship: "Championship",
}

export const LEAGUE_PILL_ACTIVE_CLASSES: Record<LeagueSlug, string> = {
  premiership: "bg-prem-900 text-prem-400",
  championship: "bg-champ-900 text-champ-400",
}

export const IS_VALID_LEAGUE_SLUG = (slug: string): slug is LeagueSlug =>
  slug === "premiership" || slug === "championship"

const FPL_DRAFT_BASE = "https://draft.premierleague.com/api"

export const FPL_ENDPOINTS = {
  leagueDetails: (id: number) => `${FPL_DRAFT_BASE}/league/${id}/details`,
  draftChoices: (id: number) => `${FPL_DRAFT_BASE}/draft/${id}/choices`,
  transactions: (id: number) => `${FPL_DRAFT_BASE}/draft/league/${id}/transactions`,
  trades: (id: number) => `${FPL_DRAFT_BASE}/draft/league/${id}/trades`,
  bootstrapStatic: () => `${FPL_DRAFT_BASE}/bootstrap-static`,
  game: () => `${FPL_DRAFT_BASE}/game`,
  entryHistory: (entryId: number) => `${FPL_DRAFT_BASE}/entry/${entryId}/history`,
  entryEventPicks: (entryId: number, eventId: number) =>
    `${FPL_DRAFT_BASE}/entry/${entryId}/event/${eventId}`,
  elementSummary: (elementId: number) => `${FPL_DRAFT_BASE}/element-summary/${elementId}`,
  eventLive: (eventId: number) => `${FPL_DRAFT_BASE}/event/${eventId}/live`,
} as const

export const NAV_SECTIONS = ["home", "leagues", "gameweek", "transactions", "extra"] as const

export type NavSection = (typeof NAV_SECTIONS)[number]

export const NAV_LABELS: Record<NavSection, string> = {
  home: "Home",
  leagues: "Leagues",
  gameweek: "Game Week",
  transactions: "Transactions",
  extra: "Extra",
}

export const EXTRA_SECTIONS = ["extra", "awards", "picks", "spin-the-wheel", "stats"]

export const PICKS_DISPLAY_COUNT = 120 as const

export const POSITION_LABELS: Record<number, string> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
}

export const POSITION_COLORS: Record<number, string> = {
  1: "bg-amber-500/20 text-amber-400",
  2: "bg-sky-500/20 text-sky-400",
  3: "bg-emerald-500/20 text-emerald-400",
  4: "bg-rose-500/20 text-rose-400",
}
