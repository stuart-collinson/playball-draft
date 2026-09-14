import type { LeagueScope } from "@pbd/lib/leagues"

export const PAGE_TITLES = {
  leagues: "League",
  gameweek: "Current Gameweek",
  awards: "Awards",
  picks: "Draft Picks",
  transactions: "Transactions",
} as const

export const EXTRA_BACK_HREF = "/extra"

export const ADMIN_HREF = "/admin"

export const ADMIN_FORFEITS_HREF = "/admin/forfeits"

export const UPLOAD_FORFEIT_HREF = "/admin/forfeits/upload"

export const ADMIN_LUCK_HREF = "/admin/luck-of-the-week"

export const ADD_LUCK_HREF = "/admin/luck-of-the-week/add"

export const LUCK_HREF = "/luck-of-the-week"

export const forfeitsHref = (scope: LeagueScope): string => `/forfeits/${scope}`

export const forfeitHref = (scope: LeagueScope, id: string): string =>
  `${forfeitsHref(scope)}/${id}`
