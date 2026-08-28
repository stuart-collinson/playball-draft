import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"

export type Forfeit = {
  id: string
  season: string
  gameweek: string
  league: LeagueSlug
  type: string
  subType: string | null
  person: string
  title: string
  description: string | null
  mediaKind: ForfeitMediaKind
  mediaPath: string
  thumbPath: string
  mediaSizeBytes: number
  archive: boolean
  createdAt: string
}
