export type StatSlug =
  | "position-history"
  | "relevancy"
  | "best-gw"
  | "worst-gw"
  | "gw-wins"
  | "gw-losses"
  | "best-waivers"
  | "best-waivers-avg"
  | "one-week-wonders"
  | "best-trades"
  | "best-trades-ppg"

export type StatViewSpec =
  | { kind: "leaderboard"; type: "best" | "worst" }
  | { kind: "counts"; type: "relevancy" | "gw-wins" | "gw-losses" }
  | { kind: "waivers"; sortBy: "total" | "avg"; minGws?: number; maxGws?: number; limit?: number }
  | { kind: "trades"; sortBy: "total" | "avg"; minGws?: number }
  | { kind: "positionHistory" }

export const STAT_TABLE_ROW_LIMIT = 20

const WAIVER_AVG_MIN_GWS = 3
const TRADE_AVG_MIN_GWS = 3
const ONE_WEEK_WONDER_LIMIT = 10

export const STAT_SLUGS: StatSlug[] = [
  "position-history",
  "relevancy",
  "best-gw",
  "worst-gw",
  "gw-wins",
  "gw-losses",
  "best-waivers",
  "best-waivers-avg",
  "one-week-wonders",
  "best-trades",
  "best-trades-ppg",
]

export const STAT_LABELS: Record<StatSlug, string> = {
  "position-history": "Standings",
  relevancy: "Relevancy",
  "best-gw": "Best GW Scores",
  "worst-gw": "Worst GW Scores",
  "gw-wins": "Gameweek Wins",
  "gw-losses": "Gameweek Losses",
  "best-waivers": "Best Waivers (Total)",
  "best-waivers-avg": "Best Waivers (Avg PPG)",
  "one-week-wonders": "One Week Wonders",
  "best-trades": "Best Trades (Total)",
  "best-trades-ppg": "Best Trades (Avg PPG)",
}

export const STAT_TILE_LABELS: Record<StatSlug, string> = {
  "position-history": "Standings",
  relevancy: "Relevancy",
  "best-gw": "Best GW",
  "worst-gw": "Worst GW",
  "gw-wins": "GW Wins",
  "gw-losses": "GW Losses",
  "best-waivers": "Waivers",
  "best-waivers-avg": "Waivers PPG",
  "one-week-wonders": "Wonders",
  "best-trades": "Trades",
  "best-trades-ppg": "Trades PPG",
}

export const STAT_VIEWS: Record<StatSlug, StatViewSpec> = {
  "position-history": { kind: "positionHistory" },
  relevancy: { kind: "counts", type: "relevancy" },
  "best-gw": { kind: "leaderboard", type: "best" },
  "worst-gw": { kind: "leaderboard", type: "worst" },
  "gw-wins": { kind: "counts", type: "gw-wins" },
  "gw-losses": { kind: "counts", type: "gw-losses" },
  "best-waivers": { kind: "waivers", sortBy: "total" },
  "best-waivers-avg": { kind: "waivers", sortBy: "avg", minGws: WAIVER_AVG_MIN_GWS },
  "one-week-wonders": {
    kind: "waivers",
    sortBy: "total",
    maxGws: 1,
    limit: ONE_WEEK_WONDER_LIMIT,
  },
  "best-trades": { kind: "trades", sortBy: "total" },
  "best-trades-ppg": { kind: "trades", sortBy: "avg", minGws: TRADE_AVG_MIN_GWS },
}

export const IS_VALID_STAT_SLUG = (slug: string): slug is StatSlug =>
  STAT_SLUGS.includes(slug as StatSlug)
