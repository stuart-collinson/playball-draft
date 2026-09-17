import { personSlugForApiId } from "@pbd/lib/people"
import type { CupTie } from "@pbd/types/cups.types"

export type CupLive = {
  gameweek: number | null
  points: Record<string, number>
  toPlay: Record<string, number>
}

export type CupTieView = {
  legsOne: (number | null)[]
  legsTwo: (number | null)[]
  totalOne: number | null
  totalTwo: number | null
  toPlayOne: number | null
  toPlayTwo: number | null
}

const bySlug = (records: Record<number, number>): Record<string, number> => {
  const bySlugKey: Record<string, number> = {}

  for (const [apiId, value] of Object.entries(records)) {
    const slug = personSlugForApiId(Number(apiId))
    if (slug) bySlugKey[slug] = value
  }

  return bySlugKey
}

export const cupLiveFrom = (
  gameweek: number | null,
  points: Record<number, number>,
  toPlay: Record<number, number>,
): CupLive => ({
  gameweek,
  points: bySlug(points),
  toPlay: bySlug(toPlay),
})

const legValue = (
  stored: number | null,
  person: string | null,
  gameweek: number,
  live: CupLive | null,
): number | null => {
  if (stored !== null) return stored
  if (!live || person === null || live.gameweek !== gameweek) return null

  return live.points[person] ?? null
}

const totalOf = (values: (number | null)[]): number | null => {
  const present = values.filter((value): value is number => value !== null)
  if (present.length === 0) return null

  return present.reduce((total, value) => total + value, 0)
}

const toPlayFor = (tie: CupTie, person: string | null, live: CupLive | null): number | null => {
  if (!live || person === null || tie.status !== "live") return null
  if (!tie.legs.some((leg) => leg.gameweek === live.gameweek)) return null

  return live.toPlay[person] ?? null
}

export const cupTieView = (tie: CupTie, live: CupLive | null): CupTieView => {
  const legsOne = tie.legs.map((leg) => legValue(leg.personOne, tie.personOne, leg.gameweek, live))
  const legsTwo = tie.legs.map((leg) => legValue(leg.personTwo, tie.personTwo, leg.gameweek, live))

  return {
    legsOne,
    legsTwo,
    totalOne: totalOf(legsOne),
    totalTwo: totalOf(legsTwo),
    toPlayOne: toPlayFor(tie, tie.personOne, live),
    toPlayTwo: toPlayFor(tie, tie.personTwo, live),
  }
}
