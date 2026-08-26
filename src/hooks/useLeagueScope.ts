"use client"

import { parseLeagueScope } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import { usePathname } from "next/navigation"

export const useLeagueScope = (): LeagueScope => parseLeagueScope(usePathname())
