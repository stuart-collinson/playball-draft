import { PARTICIPANTS } from "@pbd/lib/constants/participants"
import { getLeagueIds } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"

export type LeaguePerson = {
  slug: string
  label: string
  image: string | null
}

export const personSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

export const leaguePeople = (scope: LeagueScope): LeaguePerson[] => {
  const leagueIds = getLeagueIds(scope)

  return PARTICIPANTS.filter((participant) => leagueIds.includes(participant.leagueId)).map(
    (participant) => ({
      slug: personSlug(participant.name),
      label: participant.nickname ?? participant.name,
      image: participant.image,
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

const PARTICIPANT_IMAGES_BY_SLUG = new Map(
  PARTICIPANTS.map((participant) => [personSlug(participant.name), participant.image]),
)

export const participantImageForSlug = (slug: string): string | null =>
  PARTICIPANT_IMAGES_BY_SLUG.get(slug) ?? null
