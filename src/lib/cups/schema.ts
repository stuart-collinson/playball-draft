import { CUP_FORMATS, CUP_NAME_MAX_LENGTH } from "@pbd/lib/constants/Cups"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"
import { isCupScheduleOrdered } from "@pbd/lib/cups/schedule"
import { customIssue } from "@pbd/lib/zod"
import type { CupFormat, CupRound, CupSchedule } from "@pbd/types/cups.types"
import { z } from "zod"

export type CupScheduleInput = {
  format: CupFormat
  roundOf16Gameweek: number
  quarterFinalGameweek: number
  semiFinalGameweek: number
  finalGameweek: number
}

export const CUP_ROUND_FIELDS = {
  round_of_16: "roundOf16Gameweek",
  quarter_final: "quarterFinalGameweek",
  semi_final: "semiFinalGameweek",
  final: "finalGameweek",
} as const satisfies Record<CupRound, keyof CupScheduleInput>

const nameSchema = z.string().trim().min(1, "Give the cup a name").max(CUP_NAME_MAX_LENGTH)

const gameweekSchema = z.number().int().min(1).max(LAST_GAMEWEEK)

const scheduleShape = {
  format: z.enum(CUP_FORMATS),
  roundOf16Gameweek: gameweekSchema,
  quarterFinalGameweek: gameweekSchema,
  semiFinalGameweek: gameweekSchema,
  finalGameweek: gameweekSchema,
}

export const cupScheduleFrom = (input: CupScheduleInput): CupSchedule => ({
  round_of_16: input.roundOf16Gameweek,
  quarter_final: input.quarterFinalGameweek,
  semi_final: input.semiFinalGameweek,
  final: input.finalGameweek,
})

export const cupScheduleToInput = (format: CupFormat, schedule: CupSchedule): CupScheduleInput => ({
  format,
  roundOf16Gameweek: schedule.round_of_16,
  quarterFinalGameweek: schedule.quarter_final,
  semiFinalGameweek: schedule.semi_final,
  finalGameweek: schedule.final,
})

const refineSchedule = (input: CupScheduleInput, ctx: z.RefinementCtx): void => {
  if (!isCupScheduleOrdered(input.format, cupScheduleFrom(input)))
    customIssue(ctx, "finalGameweek", "Those rounds overlap or run past the season")
}

export const createCupInputSchema = z
  .object({ name: nameSchema, ...scheduleShape })
  .superRefine(refineSchedule)

export type CreateCupInput = z.infer<typeof createCupInputSchema>

export const updateCupInputSchema = z
  .object({ id: z.string().uuid(), name: nameSchema, ...scheduleShape })
  .superRefine(refineSchedule)

export type UpdateCupInput = z.infer<typeof updateCupInputSchema>
