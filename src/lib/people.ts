import { LEAGUE_LABELS, LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { PARTICIPANTS } from "@pbd/lib/constants/participants"
import { getLeagueIds } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"

export type LeaguePerson = {
  slug: string
  label: string
  image: string | null
  league: LeagueSlug
}

export const personSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

const LEAGUE_ID_TO_SLUG = new Map<number, LeagueSlug>(
  LEAGUE_SLUGS.map((slug) => [LEAGUE_SLUG_TO_ID[slug], slug]),
)

export const leaguePeople = (scope: LeagueScope): LeaguePerson[] => {
  const leagueIds = getLeagueIds(scope)

  return PARTICIPANTS.flatMap((participant) => {
    const league = LEAGUE_ID_TO_SLUG.get(participant.leagueId)
    if (!league || !leagueIds.includes(participant.leagueId)) return []

    return [
      {
        slug: personSlug(participant.name),
        label: participant.nickname ?? participant.name,
        image: participant.image,
        league,
      },
    ]
  })
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

const PARTICIPANT_LEAGUES_BY_SLUG = new Map(
  PARTICIPANTS.map((participant) => [
    personSlug(participant.name),
    LEAGUE_ID_TO_SLUG.get(participant.leagueId) ?? null,
  ]),
)

export const participantLeagueForSlug = (slug: string): LeagueSlug | null =>
  PARTICIPANT_LEAGUES_BY_SLUG.get(slug) ?? null

export const peopleLabel = (slugs: readonly string[]): string =>
  slugs.map(participantLabelForSlug).join(" & ")

export const peopleLeaguesLabel = (slugs: readonly string[]): string => {
  const labels = slugs
    .map(participantLeagueForSlug)
    .filter((league): league is LeagueSlug => league !== null)
    .map((league) => LEAGUE_LABELS[league])

  return [...new Set(labels)].join(" · ")
}
