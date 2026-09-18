import { CUP_ROUNDS } from "@pbd/lib/constants/Cups"
import type { CupFormat, CupRound, CupSchedule } from "@pbd/types/cups.types"

const SINGLE_LEG = 1

const TWO_LEGS = 2

export const cupRoundIndex = (round: CupRound): number => CUP_ROUNDS.indexOf(round)

export const previousCupRound = (round: CupRound): CupRound | null =>
  CUP_ROUNDS[cupRoundIndex(round) - 1] ?? null

export const nextCupRound = (round: CupRound): CupRound | null =>
  CUP_ROUNDS[cupRoundIndex(round) + 1] ?? null

export const cupLegCount = (format: CupFormat, round: CupRound): number =>
  round === "final" || format === "knockout" ? SINGLE_LEG : TWO_LEGS

export const cupRoundGameweeks = (
  format: CupFormat,
  schedule: CupSchedule,
  round: CupRound,
): number[] => Array.from({ length: cupLegCount(format, round) }, (_, leg) => schedule[round] + leg)

export const cupRoundLastGameweek = (
  format: CupFormat,
  schedule: CupSchedule,
  round: CupRound,
): number => schedule[round] + cupLegCount(format, round) - 1

export const cupGameweeksAfter = (format: CupFormat, round: CupRound): number =>
  CUP_ROUNDS.slice(cupRoundIndex(round) + 1).reduce(
    (total, later) => total + cupLegCount(format, later),
    0,
  )

export const cupTieKey = (round: CupRound, position: number): string => `${round}-${position}`
