import { CUP_ROUND_LABELS, CUP_ROUND_SHORT_LABELS } from "@pbd/lib/constants/Cups"
import { cupRoundGameweeks, cupRoundLastGameweek } from "@pbd/lib/cups/rounds"
import { participantLabelForSlug } from "@pbd/lib/people"
import type { CupFormat, CupRound, CupSchedule, CupStatus } from "@pbd/types/cups.types"

const RANGE_DASH = "–"

export const cupRoundGameweekLabel = (
  format: CupFormat,
  schedule: CupSchedule,
  round: CupRound,
): string => {
  const gameweeks = cupRoundGameweeks(format, schedule, round)
  const first = gameweeks[0] ?? schedule[round]
  const last = gameweeks[gameweeks.length - 1] ?? first

  return first === last ? `GW ${first}` : `GW ${first}${RANGE_DASH}${last}`
}

export const cupSpanLabel = (format: CupFormat, schedule: CupSchedule): string =>
  `GW ${schedule.round_of_16}${RANGE_DASH}${cupRoundLastGameweek(format, schedule, "final")}`

export const cupStatusLabel = (status: CupStatus, currentRound: CupRound | null): string => {
  if (status === "finished") return "Finished"
  if (status === "unfinished") return "Never finished"

  return currentRound ? CUP_ROUND_LABELS[currentRound] : "Running"
}

export const cupStatusShortLabel = (status: CupStatus, currentRound: CupRound | null): string => {
  if (status === "finished") return "Done"
  if (status === "unfinished") return "—"

  return currentRound ? CUP_ROUND_SHORT_LABELS[currentRound] : "Live"
}

export const cupFeedersLabel = (feeders: readonly string[]): string =>
  feeders.length === 0 ? "?" : feeders.map(participantLabelForSlug).join(" or ")
