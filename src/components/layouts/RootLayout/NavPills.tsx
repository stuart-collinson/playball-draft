"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { JSX } from "react"
import { NAV_LABELS, NAV_SECTIONS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug, NavSection } from "@pbd/lib/constants/fpl"
import { cn } from "@pbd/lib/utils/cn"

const extractLeagueSlug = (pathname: string): LeagueSlug => {
  if (pathname.includes("championship")) return "championship"
  return "premiership"
}

export const NavPills = (): JSX.Element => {
  const pathname = usePathname()
  const activeSection = NAV_SECTIONS.find((s) => pathname.startsWith(`/${s}`)) ?? "leagues"
  const leagueSlug = extractLeagueSlug(pathname)

  return (
    <nav className="flex gap-1">
      {NAV_SECTIONS.map((section: NavSection) => (
        <Link
          key={section}
          href={`/${section}/${leagueSlug}`}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            activeSection === section
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {NAV_LABELS[section]}
        </Link>
      ))}
    </nav>
  )
}
