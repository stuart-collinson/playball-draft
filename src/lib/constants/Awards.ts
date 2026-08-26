export type AwardKey =
  | "mostPoints"
  | "leastPoints"
  | "mostGwWins"
  | "mostGwLasts"
  | "mostRelevant"
  | "leastRelevant"
  | "highestGwScore"
  | "lowestGwScore"
  | "biggestMargin"
  | "closestCall"
  | "bestLosingScore"
  | "cheapestWin"
  | "biggestBenchWaste"
  | "bestWaiver"
  | "bestTrade"
  | "mostWaivers"
  | "mostTrades"
  | "mostFreeAgents"
  | "highestNetGain"

export type AwardValueFormat = "points" | "count" | "percent"

export type AwardDefinition = {
  key: AwardKey
  label: string
  labelColor: string
  ruleColor: string
  format: AwardValueFormat
  hasDetail: boolean
}

export const AWARD_DEFINITIONS: AwardDefinition[] = [
  {
    key: "mostPoints",
    label: "Most Points",
    labelColor: "text-yellow-400",
    ruleColor: "bg-yellow-500/20",
    format: "points",
    hasDetail: false,
  },
  {
    key: "leastPoints",
    label: "Least Points",
    labelColor: "text-red-400",
    ruleColor: "bg-red-500/20",
    format: "points",
    hasDetail: false,
  },
  {
    key: "mostGwWins",
    label: "Most GW Wins",
    labelColor: "text-green-400",
    ruleColor: "bg-green-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "mostGwLasts",
    label: "Most GW Losses",
    labelColor: "text-orange-400",
    ruleColor: "bg-orange-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "mostRelevant",
    label: "Most Relevant",
    labelColor: "text-sky-400",
    ruleColor: "bg-sky-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "leastRelevant",
    label: "Least Relevant",
    labelColor: "text-slate-400",
    ruleColor: "bg-slate-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "highestGwScore",
    label: "Highest GW",
    labelColor: "text-emerald-400",
    ruleColor: "bg-emerald-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "lowestGwScore",
    label: "Lowest GW",
    labelColor: "text-rose-400",
    ruleColor: "bg-rose-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "biggestMargin",
    label: "Biggest Margin",
    labelColor: "text-lime-400",
    ruleColor: "bg-lime-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "closestCall",
    label: "Closest Call",
    labelColor: "text-indigo-400",
    ruleColor: "bg-indigo-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "bestLosingScore",
    label: "Best Losing Score",
    labelColor: "text-fuchsia-400",
    ruleColor: "bg-fuchsia-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "cheapestWin",
    label: "Cheapest Win",
    labelColor: "text-zinc-400",
    ruleColor: "bg-zinc-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "biggestBenchWaste",
    label: "Bench Waste",
    labelColor: "text-pink-400",
    ruleColor: "bg-pink-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "bestWaiver",
    label: "Best Waiver",
    labelColor: "text-purple-400",
    ruleColor: "bg-purple-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "bestTrade",
    label: "Best Trade",
    labelColor: "text-violet-400",
    ruleColor: "bg-violet-500/20",
    format: "points",
    hasDetail: true,
  },
  {
    key: "mostWaivers",
    label: "Most Waivers",
    labelColor: "text-blue-400",
    ruleColor: "bg-blue-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "mostTrades",
    label: "Most Trades",
    labelColor: "text-amber-400",
    ruleColor: "bg-amber-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "mostFreeAgents",
    label: "Most Free Agents",
    labelColor: "text-teal-400",
    ruleColor: "bg-teal-500/20",
    format: "count",
    hasDetail: false,
  },
  {
    key: "highestNetGain",
    label: "Net Gain",
    labelColor: "text-cyan-400",
    ruleColor: "bg-cyan-500/20",
    format: "percent",
    hasDetail: false,
  },
]

const NET_GAIN_DECIMALS = 1

export const formatAwardValue = (format: AwardValueFormat, value: number): string => {
  if (format === "points") return `${value} pts`
  if (format === "percent") return `${value >= 0 ? "+" : ""}${value.toFixed(NET_GAIN_DECIMALS)}%`

  return String(value)
}
