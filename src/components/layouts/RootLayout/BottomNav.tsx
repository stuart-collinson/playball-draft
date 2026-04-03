"use client"

import { Home, LayoutGrid, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { JSX } from "react"
import type { LeagueSlug, NavSection } from "@pbd/lib/constants/fpl"
import { cn } from "@pbd/lib/utils/cn"

const extractLeagueSlug = (pathname: string): LeagueSlug =>
  pathname.includes("championship") ? "championship" : "premiership"

const NAV_ITEMS: {
  section: NavSection
  label: string
  icon: typeof Home
}[] = [
  { section: "home", label: "Home", icon: Home },
  { section: "leagues", label: "Leagues", icon: Trophy },
  { section: "form", label: "Form", icon: TrendingUp },
  { section: "picks", label: "Picks", icon: LayoutGrid },
]

export const BottomNav = (): JSX.Element => {
  const pathname = usePathname()
  const leagueSlug = extractLeagueSlug(pathname)
  const activeSection =
    NAV_ITEMS.find((item) => pathname.startsWith(`/${item.section}`))?.section ?? "home"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-stretch">
        {NAV_ITEMS.map(({ section, label, icon: Icon }) => {
          const isActive = activeSection === section
          const href = section === "home" ? "/home" : `/${section}/${leagueSlug}`

          return (
            <Link
              key={section}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn("transition-transform", isActive && "scale-110")}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
