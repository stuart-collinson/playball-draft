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
  | "points-race"
  | "form"
  | "all-play"
  | "luck"
  | "pace"
  | "streaks"
  | "records"
  | "consistency"
  | "floor-ceiling"
  | "thresholds"
  | "bench"
  | "tinker"
  | "rivalries"
  | "draft-grades"
  | "draft-steals"
  | "draft-busts"
  | "draft-rounds"
  | "draft-reach"
  | "worst-waivers"
  | "got-away"
  | "market-report"
  | "free-agent-xi"
  | "treatment"

export type StatViewSpec =
  | { kind: "leaderboard"; type: "best" | "worst" }
  | { kind: "counts"; type: "relevancy" | "gw-wins" | "gw-losses" }
  | {
      kind: "waivers"
      sortBy: "total" | "avg"
      direction?: "best" | "worst"
      minGws?: number
      maxGws?: number
      limit?: number
    }
  | { kind: "trades"; sortBy: "total" | "avg"; minGws?: number }
  | { kind: "positionHistory" }
  | { kind: "pointsRace" }
  | { kind: "allPlay"; variant: "all-play" | "luck" }
  | { kind: "distribution"; variant: "consistency" | "floor-ceiling" | "thresholds" }
  | { kind: "bench" }
  | { kind: "form" }
  | { kind: "streaks" }
  | { kind: "tinker" }
  | { kind: "pace" }
  | { kind: "records" }
  | { kind: "rivalry" }
  | { kind: "draft"; variant: "grades" | "steals" | "busts" | "rounds" | "reach" }
  | { kind: "gotAway" }
  | { kind: "marketReport" }
  | { kind: "freeAgentXi" }
  | { kind: "treatment" }

export type StatGroup = { key: string; label: string; slugs: StatSlug[] }

export const STAT_TABLE_ROW_LIMIT = 20

const WAIVER_AVG_MIN_GWS = 3
const WORST_WAIVER_MIN_GWS = 3
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
  "points-race",
  "form",
  "all-play",
  "luck",
  "pace",
  "streaks",
  "records",
  "consistency",
  "floor-ceiling",
  "thresholds",
  "bench",
  "tinker",
  "rivalries",
  "draft-grades",
  "draft-steals",
  "draft-busts",
  "draft-rounds",
  "draft-reach",
  "worst-waivers",
  "got-away",
  "market-report",
  "free-agent-xi",
  "treatment",
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
  "points-race": "Points Race",
  form: "Form (Last 6)",
  "all-play": "All-Play Table",
  luck: "Luck Index",
  pace: "Title Pace",
  streaks: "Hot & Cold Streaks",
  records: "Records Board",
  consistency: "Consistency",
  "floor-ceiling": "Floor & Ceiling",
  thresholds: "Threshold Clubs",
  bench: "Bench Points Wasted",
  tinker: "Tinker Chart",
  rivalries: "Rivalry Grid",
  "draft-grades": "Draft Grades",
  "draft-steals": "Draft Steals",
  "draft-busts": "Draft Busts",
  "draft-rounds": "Round Winners",
  "draft-reach": "Reach Index",
  "worst-waivers": "Worst Waivers",
  "got-away": "The Ones That Got Away",
  "market-report": "Market Report",
  "free-agent-xi": "Free Agent XI",
  treatment: "Treatment Table",
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
  "points-race": "Race",
  form: "Form",
  "all-play": "All-Play",
  luck: "Luck",
  pace: "Pace",
  streaks: "Streaks",
  records: "Records",
  consistency: "Consistency",
  "floor-ceiling": "Floor–Ceiling",
  thresholds: "60+ Club",
  bench: "Bench",
  tinker: "Tinker",
  rivalries: "Rivalries",
  "draft-grades": "Grades",
  "draft-steals": "Steals",
  "draft-busts": "Busts",
  "draft-rounds": "Rounds",
  "draft-reach": "Reach",
  "worst-waivers": "Flops",
  "got-away": "Got Away",
  "market-report": "Market",
  "free-agent-xi": "FA XI",
  treatment: "Treatment",
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
  "points-race": { kind: "pointsRace" },
  form: { kind: "form" },
  "all-play": { kind: "allPlay", variant: "all-play" },
  luck: { kind: "allPlay", variant: "luck" },
  pace: { kind: "pace" },
  streaks: { kind: "streaks" },
  records: { kind: "records" },
  consistency: { kind: "distribution", variant: "consistency" },
  "floor-ceiling": { kind: "distribution", variant: "floor-ceiling" },
  thresholds: { kind: "distribution", variant: "thresholds" },
  bench: { kind: "bench" },
  tinker: { kind: "tinker" },
  rivalries: { kind: "rivalry" },
  "draft-grades": { kind: "draft", variant: "grades" },
  "draft-steals": { kind: "draft", variant: "steals" },
  "draft-busts": { kind: "draft", variant: "busts" },
  "draft-rounds": { kind: "draft", variant: "rounds" },
  "draft-reach": { kind: "draft", variant: "reach" },
  "worst-waivers": {
    kind: "waivers",
    sortBy: "total",
    direction: "worst",
    minGws: WORST_WAIVER_MIN_GWS,
  },
  "got-away": { kind: "gotAway" },
  "market-report": { kind: "marketReport" },
  "free-agent-xi": { kind: "freeAgentXi" },
  treatment: { kind: "treatment" },
}

export const STAT_GROUPS: StatGroup[] = [
  {
    key: "race",
    label: "The Race",
    slugs: [
      "position-history",
      "points-race",
      "form",
      "all-play",
      "luck",
      "pace",
      "streaks",
      "records",
    ],
  },
  {
    key: "managers",
    label: "The Managers",
    slugs: [
      "best-gw",
      "worst-gw",
      "gw-wins",
      "gw-losses",
      "relevancy",
      "consistency",
      "floor-ceiling",
      "thresholds",
      "bench",
      "tinker",
      "treatment",
    ],
  },
  { key: "rivalries", label: "The Rivalries", slugs: ["rivalries"] },
  {
    key: "draft",
    label: "The Draft",
    slugs: ["draft-grades", "draft-steals", "draft-busts", "draft-rounds", "draft-reach"],
  },
  {
    key: "market",
    label: "The Market",
    slugs: [
      "best-waivers",
      "best-waivers-avg",
      "one-week-wonders",
      "best-trades",
      "best-trades-ppg",
      "worst-waivers",
      "got-away",
      "market-report",
      "free-agent-xi",
    ],
  },
]

export const IS_VALID_STAT_SLUG = (slug: string): slug is StatSlug =>
  STAT_SLUGS.includes(slug as StatSlug)
