import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"

// The display name for a league entry: the configured nickname, then the
// configured full name, then whatever FPL reports. One definition so every
// stat resolves names identically.
export const participantDisplayName = (apiId: number, fplFallback: string): string => {
  const participant = PARTICIPANT_BY_API_ID[apiId]

  return participant?.nickname ?? participant?.name ?? fplFallback
}
