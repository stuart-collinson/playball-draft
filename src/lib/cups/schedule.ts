import { CUP_MINIMUM_GAMEWEEKS, CUP_ROUNDS } from "@pbd/lib/constants/Cups"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"
import {
  cupGameweeksAfter,
  cupLegCount,
  cupRoundLastGameweek,
  previousCupRound,
} from "@pbd/lib/cups/rounds"
import type { CupFormat, CupGameweekOption, CupRound, CupSchedule } from "@pbd/types/cups.types"

export const canCreateCup = (format: CupFormat, firstOpenGameweek: number | null): boolean =>
  firstOpenGameweek !== null &&
  firstOpenGameweek + CUP_MINIMUM_GAMEWEEKS[format] - 1 <= LAST_GAMEWEEK

export const earliestCupGameweek = (
  format: CupFormat,
  round: CupRound,
  chosen: Partial<CupSchedule>,
  firstOpenGameweek: number,
): number => {
  const earlier = previousCupRound(round)
  if (!earlier) return firstOpenGameweek

  const earlierGameweek = chosen[earlier]
  if (earlierGameweek === undefined) return firstOpenGameweek

  return earlierGameweek + cupLegCount(format, earlier)
}

export const latestCupGameweek = (format: CupFormat, round: CupRound): number =>
  LAST_GAMEWEEK - cupGameweeksAfter(format, round) - (cupLegCount(format, round) - 1)

export const cupGameweekOptions = (
  format: CupFormat,
  round: CupRound,
  chosen: Partial<CupSchedule>,
  firstOpenGameweek: number,
): CupGameweekOption[] => {
  const earliest = earliestCupGameweek(format, round, chosen, firstOpenGameweek)
  const latest = latestCupGameweek(format, round)

  return Array.from({ length: LAST_GAMEWEEK }, (_, index) => {
    const gameweek = index + 1
    if (gameweek < firstOpenGameweek) return { gameweek, block: "deadline_passed" as const }
    if (gameweek < earliest) return { gameweek, block: "clashes" as const }
    if (gameweek > latest) return { gameweek, block: "no_room" as const }

    return { gameweek, block: null }
  })
}

export const defaultCupSchedule = (format: CupFormat, firstOpenGameweek: number): CupSchedule => {
  const roundOf16 = firstOpenGameweek
  const quarterFinal = roundOf16 + cupLegCount(format, "round_of_16")
  const semiFinal = quarterFinal + cupLegCount(format, "quarter_final")
  const final = semiFinal + cupLegCount(format, "semi_final")

  return {
    round_of_16: roundOf16,
    quarter_final: quarterFinal,
    semi_final: semiFinal,
    final,
  }
}

export const isCupScheduleOrdered = (format: CupFormat, schedule: CupSchedule): boolean => {
  if (cupRoundLastGameweek(format, schedule, "final") > LAST_GAMEWEEK) return false

  return CUP_ROUNDS.every((round) => {
    if (schedule[round] < 1) return false

    const earlier = previousCupRound(round)
    if (!earlier) return true

    return schedule[round] > cupRoundLastGameweek(format, schedule, earlier)
  })
}

export const withCupRoundGameweek = (
  format: CupFormat,
  schedule: CupSchedule,
  round: CupRound,
  gameweek: number,
): CupSchedule => {
  const next: CupSchedule = { ...schedule, [round]: gameweek }

  for (const current of CUP_ROUNDS) {
    const earlier = previousCupRound(current)
    if (!earlier) continue

    const minimum = next[earlier] + cupLegCount(format, earlier)
    if (next[current] < minimum) next[current] = minimum
  }

  return next
}

export const lockedCupRounds = (
  schedule: CupSchedule,
  firstOpenGameweek: number | null,
): CupRound[] => {
  if (firstOpenGameweek === null) return [...CUP_ROUNDS]

  return CUP_ROUNDS.filter((round) => schedule[round] < firstOpenGameweek)
}
