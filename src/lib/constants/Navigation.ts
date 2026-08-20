import { STAT_SLUGS, STAT_TILE_LABELS } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import { COMBINED_SCOPE, DEFAULT_LEAGUE_SLUG } from "@pbd/lib/leagues"
import {
  ClipboardList,
  Crown,
  Disc3,
  Flame,
  Gauge,
  Medal,
  Repeat,
  Scale,
  Snowflake,
  Sparkles,
  Target,
  ThumbsDown,
  TrendingUp,
  UserPlus,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavigationTile = {
  label: string
  href: string
  icon: LucideIcon
  accent: string
}

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

export const buildStatTiles = (): NavigationTile[] =>
  STAT_SLUGS.map((slug) => ({
    label: STAT_TILE_LABELS[slug],
    href: `/stats/${COMBINED_SCOPE}/${slug}`,
    icon: STAT_ICONS[slug],
    accent: STAT_ACCENTS[slug],
  }))
