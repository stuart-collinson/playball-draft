import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/App"
import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCategory, ForfeitTypeSlug } from "@pbd/lib/constants/Forfeits"
import { isWeeklyGameweek } from "@pbd/lib/gameweeks"

export type ForfeitSelection = {
  type: ForfeitTypeSlug
  subType: string | null
}

const TYPE_BY_SLUG = new Map(FORFEIT_TYPES.map((type) => [type.slug as string, type]))

const SUB_TYPE_SLUGS = new Set<string>(WILDCARD_SUB_TYPES.map((subType) => subType.slug))

export const resolveForfeitSelection = (slug: string): ForfeitSelection | null => {
  if (SUB_TYPE_SLUGS.has(slug)) return { type: "wildcard", subType: slug }

  const type = TYPE_BY_SLUG.get(slug)
  if (!type || type.slug === "wildcard") return null

  return { type: type.slug, subType: null }
}

export const isWildcardSubTypeSlug = (slug: string): boolean => SUB_TYPE_SLUGS.has(slug)

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

  return isWeeklyGameweek(gameweek)
}

const SUB_TYPE_LABELS_BY_SLUG = new Map(
  WILDCARD_SUB_TYPES.map((subType) => [subType.slug as string, subType.label]),
)

const SUB_TYPE_DEFAULT_TITLES = new Map(
  WILDCARD_SUB_TYPES.map((subType) => [subType.slug as string, subType.defaultTitle]),
)

const TYPE_DEFAULT_TITLES = new Map(
  FORFEIT_TYPES.map((type) => [type.slug as string, type.defaultTitle]),
)

export const forfeitDefaultTitle = (selectionSlug: string): string =>
  SUB_TYPE_DEFAULT_TITLES.get(selectionSlug) ?? TYPE_DEFAULT_TITLES.get(selectionSlug) ?? ""

export const forfeitDisplayLabel = (type: string, subType: string | null): string => {
  const typeLabel = TYPE_BY_SLUG.get(type)?.label
  if (!typeLabel) return type

  const subTypeLabel = subType === null ? null : SUB_TYPE_LABELS_BY_SLUG.get(subType)
  return subTypeLabel ? `${typeLabel} · ${subTypeLabel}` : typeLabel
}
