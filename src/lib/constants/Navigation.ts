import { STAT_GROUPS, STAT_TILE_LABELS } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import { COMBINED_SCOPE, DEFAULT_LEAGUE_SLUG } from "@pbd/lib/leagues"
import {
  Activity,
  Armchair,
  ArrowUpDown,
  BarChart3,
  ClipboardList,
  Clover,
  Crown,
  Disc3,
  Flame,
  Gauge,
  Medal,
  Network,
  Repeat,
  Rocket,
  Ruler,
  Scale,
  Snowflake,
  Sparkles,
  Star,
  Swords,
  Target,
  ThumbsDown,
  TrendingUp,
  Trophy,
  UserPlus,
  Wrench,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavigationTile = {
  label: string
  href: string
  icon: LucideIcon
  accent: string
}

export type NavigationTileGroup = { heading: string; tiles: NavigationTile[] }

const STAT_ICONS: Record<StatSlug, LucideIcon> = {
  "position-history": TrendingUp,
  relevancy: Target,
  "best-gw": Flame,
  "worst-gw": Snowflake,
  "gw-wins": Crown,
  "gw-losses": ThumbsDown,
  "best-waivers": UserPlus,
  "best-waivers-avg": Gauge,
  "one-week-wonders": Sparkles,
  "best-trades": Repeat,
  "best-trades-ppg": Scale,
  "points-race": Rocket,
  form: Activity,
  "all-play": Network,
  luck: Clover,
  pace: Trophy,
  streaks: Zap,
  records: Star,
  consistency: Ruler,
  "floor-ceiling": ArrowUpDown,
  thresholds: BarChart3,
  bench: Armchair,
  tinker: Wrench,
  rivalries: Swords,
}

const STAT_ACCENTS: Record<StatSlug, string> = {
  "position-history": "bg-sky-500/15 text-sky-400",
  relevancy: "bg-cyan-500/15 text-cyan-400",
  "best-gw": "bg-emerald-500/15 text-emerald-400",
  "worst-gw": "bg-orange-500/15 text-orange-400",
  "gw-wins": "bg-green-500/15 text-green-400",
  "gw-losses": "bg-red-500/15 text-red-400",
  "best-waivers": "bg-blue-500/15 text-blue-400",
  "best-waivers-avg": "bg-indigo-500/15 text-indigo-400",
  "one-week-wonders": "bg-fuchsia-500/15 text-fuchsia-400",
  "best-trades": "bg-purple-500/15 text-purple-400",
  "best-trades-ppg": "bg-teal-500/15 text-teal-400",
  "points-race": "bg-rose-500/15 text-rose-400",
  form: "bg-lime-500/15 text-lime-400",
  "all-play": "bg-sky-500/15 text-sky-400",
  luck: "bg-emerald-500/15 text-emerald-400",
  pace: "bg-yellow-500/15 text-yellow-400",
  streaks: "bg-orange-500/15 text-orange-400",
  records: "bg-amber-500/15 text-amber-400",
  consistency: "bg-slate-500/15 text-slate-400",
  "floor-ceiling": "bg-violet-500/15 text-violet-400",
  thresholds: "bg-pink-500/15 text-pink-400",
  bench: "bg-stone-500/15 text-stone-400",
  tinker: "bg-zinc-500/15 text-zinc-400",
  rivalries: "bg-red-500/15 text-red-400",
}

export const buildPageTiles = (): NavigationTile[] => [
  {
    label: "Spin the Wheel",
    href: "/spin-the-wheel",
    icon: Disc3,
    accent: "bg-pink-500/15 text-pink-400",
  },
  {
    label: "Awards",
    href: `/awards/${COMBINED_SCOPE}`,
    icon: Medal,
    accent: "bg-amber-500/15 text-amber-400",
  },
  {
    label: "Picks",
    href: `/picks/${DEFAULT_LEAGUE_SLUG}`,
    icon: ClipboardList,
    accent: "bg-violet-500/15 text-violet-400",
  },
]

const statTile = (slug: StatSlug): NavigationTile => ({
  label: STAT_TILE_LABELS[slug],
  href: `/stats/${COMBINED_SCOPE}/${slug}`,
  icon: STAT_ICONS[slug],
  accent: STAT_ACCENTS[slug],
})

export const buildStatTileGroups = (): NavigationTileGroup[] =>
  STAT_GROUPS.map((group) => ({
    heading: group.label,
    tiles: group.slugs.map(statTile),
  }))
