import { ANNUAL_GAMEWEEK, FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCategory, ForfeitTypeSlug } from "@pbd/lib/constants/Forfeits"

export type ForfeitSelection = {
  type: ForfeitTypeSlug
  subType: string | null
}

const TYPE_BY_SLUG = new Map(FORFEIT_TYPES.map((type) => [type.slug as string, type]))

const SUB_TYPE_SLUGS = new Set<string>(WILDCARD_SUB_TYPES.map((subType) => subType.slug))

const WEEKLY_GAMEWEEK_PATTERN = /^([1-9]|[12][0-9]|3[0-8])$/

export const resolveForfeitSelection = (slug: string): ForfeitSelection | null => {
  if (SUB_TYPE_SLUGS.has(slug)) return { type: "wildcard", subType: slug }

  const type = TYPE_BY_SLUG.get(slug)
  if (!type || type.slug === "wildcard") return null

  return { type: type.slug, subType: null }
}

export const isValidForfeitPair = (type: string, subType: string | null): boolean => {
  if (!TYPE_BY_SLUG.has(type)) return false
  if (type === "wildcard") return subType !== null && SUB_TYPE_SLUGS.has(subType)

  return subType === null
}

export const forfeitCategory = (type: string): ForfeitCategory | null =>
  TYPE_BY_SLUG.get(type)?.category ?? null

export const isValidForfeitGameweek = (type: string, gameweek: string): boolean => {
  const category = forfeitCategory(type)
  if (category === null) return false
  if (category === "annual") return gameweek === ANNUAL_GAMEWEEK

  return WEEKLY_GAMEWEEK_PATTERN.test(gameweek)
}
