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
  | "round-robin"
  | "luck"
  | "pace"
  | "streaks"
  | "consistency"
  | "thresholds"
  | "bench"
  | "goals"
  | "assists"
  | "clean-sheets"
  | "defcon"
  | "rivalries"
  | "worst-waivers"
  | "got-away"
  | "free-agent-xi"

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
  | { kind: "roundRobin"; variant: "round-robin" | "luck" }
  | { kind: "distribution"; variant: "consistency" | "thresholds" }
  | { kind: "bench" }
  | { kind: "squadReturns"; variant: "goals" | "assists" | "clean-sheets" | "defcon" }
  | { kind: "form" }
  | { kind: "streaks" }
  | { kind: "pace" }
  | { kind: "rivalry" }
  | { kind: "gotAway" }
  | { kind: "freeAgentXi" }

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
  "round-robin",
  "luck",
  "pace",
  "streaks",
  "consistency",
  "thresholds",
  "bench",
  "goals",
  "assists",
  "clean-sheets",
  "defcon",
  "rivalries",
  "worst-waivers",
  "got-away",
  "free-agent-xi",
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
  "round-robin": "Round Robin",
  luck: "Luck Index",
  pace: "Title Pace",
  streaks: "Hot & Cold Streaks",
  consistency: "Consistency",
  thresholds: "60 Point Club",
  bench: "Bench Points Wasted",
  goals: "Most Goals",
  assists: "Most Assists",
  "clean-sheets": "Clean Sheets",
  defcon: "Defcon Points",
  rivalries: "Rivalry Grid",
  "worst-waivers": "Worst Waivers",
  "got-away": "The Ones That Got Away",
  "free-agent-xi": "Free Agent XI",
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
  "round-robin": "Round Robin",
  luck: "Luck",
  pace: "Pace",
  streaks: "Streaks",
  consistency: "Consistency",
  thresholds: "60 Point Club",
  bench: "Bench",
  goals: "Goals",
  assists: "Assists",
  "clean-sheets": "Clean Sheets",
  defcon: "Defcon",
  rivalries: "Rivalries",
  "worst-waivers": "Flops",
  "got-away": "Got Away",
  "free-agent-xi": "FA XI",
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
  "round-robin": { kind: "roundRobin", variant: "round-robin" },
  luck: { kind: "roundRobin", variant: "luck" },
  pace: { kind: "pace" },
  streaks: { kind: "streaks" },
  consistency: { kind: "distribution", variant: "consistency" },
  thresholds: { kind: "distribution", variant: "thresholds" },
  bench: { kind: "bench" },
  goals: { kind: "squadReturns", variant: "goals" },
  assists: { kind: "squadReturns", variant: "assists" },
  "clean-sheets": { kind: "squadReturns", variant: "clean-sheets" },
  defcon: { kind: "squadReturns", variant: "defcon" },
  rivalries: { kind: "rivalry" },
  "worst-waivers": {
    kind: "waivers",
    sortBy: "total",
    direction: "worst",
    minGws: WORST_WAIVER_MIN_GWS,
  },
  "got-away": { kind: "gotAway" },
  "free-agent-xi": { kind: "freeAgentXi" },
}

export const STAT_GROUPS: StatGroup[] = [
  {
    key: "race",
    label: "The Race",
    slugs: ["position-history", "points-race", "pace", "form", "round-robin", "streaks"],
  },
  {
    key: "managers",
    label: "The Managers",
    slugs: [
      "luck",
      "rivalries",
      "bench",
      "thresholds",
      "goals",
      "assists",
      "clean-sheets",
      "defcon",
      "best-gw",
      "worst-gw",
      "gw-wins",
      "gw-losses",
      "relevancy",
      "consistency",
    ],
  },
  {
    key: "market",
    label: "The Market",
    slugs: [
      "got-away",
      "worst-waivers",
      "one-week-wonders",
      "best-waivers",
      "best-waivers-avg",
      "best-trades",
      "best-trades-ppg",
    ],
  },
]

export const STAT_HELP: Partial<Record<StatSlug, string[]>> = {
  relevancy: [
    "You score a point here every time you post the highest score in your league for a gameweek, and another every time you post the lowest. A big number means you keep making the headlines, good or bad. A small number means you sit quietly in the middle.",
  ],
  consistency: [
    "This measures how much your scores jump about from week to week. A small number means you post roughly the same score every time. A big number means you swing between brilliant and dreadful.",
  ],
  "round-robin": [
    "Each gameweek your score is compared with every rival in your league. Beat their score and that is a win over them, score less and it is a loss, and matching them is a draw. Win % counts a draw as half a win. There are no fixtures here, so nobody gets an easy or a hard week.",
  ],
  luck: [
    "Two rankings are being compared. Your table rank is where you sit on total points. Your round robin rank is where you sit on wins, which comes from beating rivals week by week on the Round Robin page.",
    "Luck is your round robin rank minus your table rank. A plus number means the points table is kinder to you than your weekly results deserve, usually because one huge week padded your total. A minus number means you win plenty of weeks but have never banked a monster score, so the table sells you short. Zero means the table has you about right.",
  ],
  pace: [
    "Your average points per gameweek so far, stretched across all 38 gameweeks. It is a rough guess at where you finish if you carry on scoring exactly as you have been.",
  ],
  streaks: [
    "A Hot week means you beat the middle score in your league that gameweek. A Cold week means you fell below it. The big number is the run you are on right now, and the line underneath shows your longest run of each. Landing exactly on the middle score ends a run.",
  ],
  goals: [
    "Every goal scored by a player in your starting eleven, added up across the season. It only counts the eleven who earned you points, so a player auto subbed on counts and a substitute who stayed on your bench does not. The smaller number is xG, which is how many goals those players were expected to score from the chances they had.",
  ],
  assists: [
    "Every assist from a player in your starting eleven, added up across the season. It only counts the eleven who earned you points, so a player auto subbed on counts and a substitute who stayed on your bench does not. The smaller number is xA, which is how many assists those players were expected to get from the chances they created.",
  ],
  "clean-sheets": [
    "A clean sheet counts here only if it actually earned you points. Keepers and defenders get four points for one and midfielders get one point, so a forward keeping a clean sheet is never counted. Like goals and assists, it only looks at the eleven who played for you that week.",
  ],
  defcon: [
    "Defensive contribution is a two point bonus for doing the dirty work. Defenders need ten or more tackles, clearances, blocks and interceptions in a match. Midfielders and forwards need twelve or more of those plus recoveries. This adds up the points your team actually earned from it, not the number of tackles they made.",
  ],
  rivalries: [
    "Each gameweek your score is compared with one rival's score at a time. Beat them that week and you get a win over them, score less and it is a loss, and matching them is a draw. So every gameweek gives you a separate result against every other manager.",
    "Your nemesis is the rival with the best record against you. Only the weeks between the two of you count, so it is not about who has the most points. If two rivals have beaten you the same number of times, the one who outscored you by more takes it. Beat everyone you have faced and you have no nemesis.",
  ],
}

export const IS_VALID_STAT_SLUG = (slug: string): slug is StatSlug =>
  STAT_SLUGS.includes(slug as StatSlug)
