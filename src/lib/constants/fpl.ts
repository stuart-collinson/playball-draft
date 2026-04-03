export const LEAGUE_IDS = {
  PREMIERSHIP: 1069,
  CHAMPIONSHIP: 32779,
} as const

export type LeagueSlug = "premiership" | "championship"

export const LEAGUE_SLUG_TO_ID: Record<LeagueSlug, number> = {
  premiership: LEAGUE_IDS.PREMIERSHIP,
  championship: LEAGUE_IDS.CHAMPIONSHIP,
}

export const LEAGUE_LABELS: Record<LeagueSlug, string> = {
  premiership: "Premiership",
  championship: "Championship",
}

export const IS_VALID_LEAGUE_SLUG = (slug: string): slug is LeagueSlug =>
  slug === "premiership" || slug === "championship"

const FPL_DRAFT_BASE = "https://draft.premierleague.com/api"

export const FPL_ENDPOINTS = {
  leagueDetails: (id: number) => `${FPL_DRAFT_BASE}/league/${id}/details`,
  draftChoices: (id: number) => `${FPL_DRAFT_BASE}/draft/${id}/choices`,
  transactions: (id: number) => `${FPL_DRAFT_BASE}/draft/league/${id}/transactions`,
  bootstrapStatic: () => `${FPL_DRAFT_BASE}/bootstrap-static`,
} as const

export const CACHE_TTL = {
  STANDINGS: 900, // 15 min — updates a few times on match days
  DRAFT_CHOICES: 2592000, // 30 days — locked for the season
  TRANSACTIONS: 900, // 15 min
  BOOTSTRAP: 2592000, // 30 days
} as const

export const NAV_SECTIONS = ["home", "leagues", "form", "picks"] as const

export type NavSection = (typeof NAV_SECTIONS)[number]

export const NAV_LABELS: Record<NavSection, string> = {
  home: "Home",
  leagues: "Leagues",
  form: "Form",
  picks: "Picks",
}

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
