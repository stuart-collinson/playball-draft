"use client"

import { LeagueScopePills } from "@pbd/components/LeagueFilter/LeagueScopePills"
import { COMBINED_SCOPE } from "@pbd/lib/leagues"
import { usePathname } from "next/navigation"
import type { JSX } from "react"

const SECTIONS_WITHOUT_FILTER = ["extra", "spin-the-wheel"]

export const LeagueFilter = (): JSX.Element | null => {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const section = segments[0] ?? ""

  if (SECTIONS_WITHOUT_FILTER.includes(section)) return null

  return (
    <LeagueScopePills
      section={section}
      activeScope={segments[1] ?? COMBINED_SCOPE}
      trailing={segments.slice(2)}
    />
  )
}
