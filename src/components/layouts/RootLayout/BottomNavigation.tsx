"use client"

import { EXTRA_SECTIONS } from "@pbd/lib/constants/fpl"
import type { NavSection } from "@pbd/lib/constants/fpl"
import { COMBINED_SCOPE, IS_VALID_LEAGUE_SCOPE } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import { cn } from "@pbd/lib/utils/cn"
import { ArrowLeftRight, CalendarDays, Home, LayoutGrid, Trophy } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { JSX } from "react"

const NAV_ITEMS: { section: NavSection; label: string; icon: LucideIcon }[] = [
  { section: "home", label: "Home", icon: Home },
  { section: "leagues", label: "Leagues", icon: Trophy },
  { section: "gameweek", label: "Game Week", icon: CalendarDays },
  { section: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { section: "extra", label: "Extra", icon: LayoutGrid },
]

const SCOPE_FREE_SECTIONS: NavSection[] = ["home", "extra"]

const extractLeagueScope = (segments: string[]): LeagueScope => {
  const scope = segments[1]
  return scope && IS_VALID_LEAGUE_SCOPE(scope) ? scope : COMBINED_SCOPE
}

const resolveActiveSection = (section: string): NavSection | null => {
  if (EXTRA_SECTIONS.includes(section)) return "extra"
  const match = NAV_ITEMS.find((item) => item.section === section)
  return match?.section ?? null
}

export const BottomNavigation = (): JSX.Element => {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const leagueScope = extractLeagueScope(segments)
  const activeSection = resolveActiveSection(segments[0] ?? "")

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-stretch">
        {NAV_ITEMS.map(({ section, label, icon: Icon }) => {
          const isActive = activeSection === section
          const href = SCOPE_FREE_SECTIONS.includes(section)
            ? `/${section}`
            : `/${section}/${leagueScope}`

          return (
            <Link
              key={section}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-3 text-[10px] font-medium leading-tight transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn("transition-transform", isActive && "scale-110")}
              />
              <span className="text-center">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
