import { ANNUAL_GAMEWEEK, FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence, ForfeitCategory, ForfeitTypeSlug } from "@pbd/lib/constants/Forfeits"
import { PARTICIPANTS } from "@pbd/lib/constants/participants"
import { getLeagueIds } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"

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

export const personSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

export type ForfeitPerson = {
  slug: string
  label: string
}

export const forfeitPeople = (scope: LeagueScope): ForfeitPerson[] => {
  const leagueIds = getLeagueIds(scope)

  return PARTICIPANTS.filter((participant) => leagueIds.includes(participant.leagueId)).map(
    (participant) => ({
      slug: personSlug(participant.name),
      label: participant.nickname ?? participant.name,
    }),
  )
}

const PARTICIPANT_LABELS_BY_SLUG = new Map(
  PARTICIPANTS.map((participant) => [
    personSlug(participant.name),
    participant.nickname ?? participant.name,
  ]),
)

export const participantLabelForSlug = (slug: string): string =>
  PARTICIPANT_LABELS_BY_SLUG.get(slug) ?? slug

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

export type ForfeitsListFilters = {
  cadence: ForfeitCadence
  gameweek?: string | null
  type?: string | null
  subType?: string | null
  person?: string | null
}

export type ForfeitsListInput = {
  league?: "premiership" | "championship"
  cadence: ForfeitCadence
  gameweek?: string
  type?: string
  subType?: string
  person?: string
}

export const buildForfeitsListInput = (
  scope: LeagueScope,
  filters: ForfeitsListFilters,
): ForfeitsListInput => {
  const input: ForfeitsListInput = { cadence: filters.cadence }
  if (scope !== "combined") input.league = scope
  if (filters.cadence === "weekly" && filters.gameweek) input.gameweek = filters.gameweek
  if (filters.type) input.type = filters.type
  if (filters.subType && filters.type === "wildcard") input.subType = filters.subType
  if (filters.person && forfeitPeople(scope).some((member) => member.slug === filters.person))
    input.person = filters.person

  return input
}
