export const LEAGUE_IDS = {
  PREMIERSHIP: 1069,
  CHAMPIONSHIP: 1070,
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
const FPL_BASE = "https://fantasy.premierleague.com/api"

export const FPL_ENDPOINTS = {
  leagueDetails: (id: number) => `${FPL_DRAFT_BASE}/league/${id}/details`,
  draftChoices: (id: number) => `${FPL_DRAFT_BASE}/draft/${id}/choices`,
  transactions: (id: number) => `${FPL_DRAFT_BASE}/draft/league/${id}/transactions`,
  bootstrapStatic: () => `${FPL_BASE}/bootstrap-static/`,
} as const

export const CACHE_TTL = {
  STANDINGS: 300,
  DRAFT_CHOICES: 3600,
  TRANSACTIONS: 300,
  BOOTSTRAP: 2592000,
} as const

export const NAV_SECTIONS = ["leagues", "form", "picks"] as const

export type NavSection = (typeof NAV_SECTIONS)[number]

export const NAV_LABELS: Record<NavSection, string> = {
  leagues: "Leagues",
  form: "Form",
  picks: "Picks",
}

export const PICKS_DISPLAY_COUNT = 50 as const
