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
  | { kind: "squadReturns"; variant: "goals" | "assists" }
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
    slugs: ["points-race", "form", "round-robin", "pace", "streaks"],
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
      "thresholds",
      "bench",
      "goals",
      "assists",
      "rivalries",
    ],
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
    ],
  },
]

export const STAT_HELP: Partial<Record<StatSlug, string[]>> = {
  relevancy: [
    "Relevancy counts how often you are the story of the week. You get one point every time you post the highest score in your league for a gameweek, and one point every time you post the lowest. The total adds those up across every finished gameweek. A big number means you make the headlines, good or bad. A small number means you sit quietly in the middle of the pack.",
  ],
  consistency: [
    "Consistency shows how steady your scores are from week to week. We take your score from every finished gameweek and measure how far a normal week sits from your average. A small number means you post roughly the same score every week. A big number means boom or bust.",
  ],
  "round-robin": [
    "Every gameweek is treated as a mini tournament where you play all of your rivals at once. Your score is compared with everyone else in your league that week. Score higher than a rival and that counts as a win over them, lower is a loss, and level is a draw. Win % counts a draw as half a win. Nobody gets an easy or a hard week here because there are no fixtures, so this table is purely about whether your score was any good.",
  ],
  luck: [
    "Luck compares two ways of ranking your season. Your table rank is where you sit on total points. Your round robin rank comes from the Round Robin page: every gameweek your score is compared with every rival, you collect wins, draws and losses, and everyone is ranked by that record.",
    "The Luck number is your round robin rank minus your table rank. A plus number means the points table ranks you higher than your week by week record says it should. That usually happens when one huge week padded your total while you lost most of the other weeks. A minus number means the opposite: you win most weeks but have never banked a monster score, so the table sells you short. Zero means the table has you spot on. Everything is worked out from each manager's points in every finished gameweek.",
  ],
  pace: [
    "Title Pace guesses the final table if everyone keeps scoring at their current rate. We take your average points per gameweek so far and multiply it across all 38 gameweeks. Early in the season one big week can swing this a lot. It settles down as more gameweeks are played.",
  ],
  streaks: [
    "A Hot week means you beat your league's median score for that gameweek, which is the middle score of everyone in your league. A Cold week means you fell below it. The streak number is how many Hot or Cold weeks you are on right now, and the line under each manager shows their longest runs this season. Landing exactly on the median resets the streak.",
  ],
  goals: [
    "Every goal scored by a player who was in your starting eleven that week, added up across the whole season. It counts the eleven who actually earned you points, so if a player was auto subbed on because somebody did not play, his goals count. A goal scored by a substitute who stayed on your bench does not, since you never got the points for it.",
  ],
  assists: [
    "Every assist set up by a player who was in your starting eleven that week, added up across the whole season. It counts the eleven who actually earned you points, so if a player was auto subbed on because somebody did not play, his assists count. An assist from a substitute who stayed on your bench does not, since you never got the points for it.",
  ],
  rivalries: [
    "This has nothing to do with total points. Every gameweek we take your score and compare it against one rival's score at a time. Beat their score that week and you get a win against that rival, score less and it is a loss, and matching them exactly is a draw. So every gameweek gives you a separate result against every other manager in your league.",
    "Find your name down the left hand side and read across. Each column is a rival and the cell shows your wins and losses against that one person. Green means you are ahead of them overall, red means they are ahead of you.",
    "Your nemesis is the rival you have the worst record against, counting only the weeks between the two of you. It is not awarded for having the most points. If two rivals have the same record against you, the one who has outscored you by more points overall gets it. Beat everyone you have faced and you have no nemesis at all.",
    "Fair warning that this is noisy early on. After a single gameweek every rival who beat you sits on the same 0-1 record, and the tie is settled on points, so whoever topped that week ends up as almost everybody's nemesis. Once a few more weeks are in the bank the records separate and it starts to mean something.",
  ],
}

export const IS_VALID_STAT_SLUG = (slug: string): slug is StatSlug =>
  STAT_SLUGS.includes(slug as StatSlug)
