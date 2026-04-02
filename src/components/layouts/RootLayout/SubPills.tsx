"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { JSX } from "react"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { cn } from "@pbd/lib/utils/cn"

const SLUGS: LeagueSlug[] = ["premiership", "championship"]

export const SubPills = (): JSX.Element => {
  const pathname = usePathname()
  const section = pathname.split("/")[1] ?? "leagues"
  const activeSlug: LeagueSlug = pathname.includes("championship") ? "championship" : "premiership"

  return (
    <div className="flex gap-1.5">
      {SLUGS.map((slug) => {
        const isPrem = slug === "premiership"
        const isActive = activeSlug === slug

        return (
          <Link
            key={slug}
            href={`/${section}/${slug}`}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive && isPrem && "bg-prem-900 text-prem-400",
              isActive && !isPrem && "bg-champ-900 text-champ-400",
              !isActive && "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {LEAGUE_LABELS[slug]}
          </Link>
        )
      })}
    </div>
  )
}
