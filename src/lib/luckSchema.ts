import { LUCK_DESCRIPTION_MAX_LENGTH, LUCK_TITLE_MAX_LENGTH } from "@pbd/lib/constants/Luck"
import { isGameweekValue } from "@pbd/lib/gameweeks"
import { leaguePeople } from "@pbd/lib/people"
import { z } from "zod"

const titleSchema = z.string().trim().min(1, "Give it a title").max(LUCK_TITLE_MAX_LENGTH)

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Tell the story")
  .max(LUCK_DESCRIPTION_MAX_LENGTH)

const customIssue = (ctx: z.RefinementCtx, path: string, message: string): void =>
  ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })

export const createLuckInputSchema = z
  .object({
    league: z.enum(["premiership", "championship"]),
    gameweek: z.string().min(1, "Pick a game week"),
    person: z.string().min(1, "Pick who got lucky"),
    title: titleSchema,
    description: descriptionSchema,
  })
  .superRefine((input, ctx) => {
    if (!isGameweekValue(input.gameweek))
      customIssue(ctx, "gameweek", "That game week doesn't exist")
    if (!leaguePeople(input.league).some((candidate) => candidate.slug === input.person))
      customIssue(ctx, "person", "That person isn't in this league")
  })

export type CreateLuckInput = z.infer<typeof createLuckInputSchema>

export const luckDetailsSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
})

export type LuckDetailsValues = z.infer<typeof luckDetailsSchema>

export const updateLuckInputSchema = z.object({
  id: z.string().uuid(),
  title: titleSchema,
  description: descriptionSchema,
})

export type UpdateLuckInput = z.infer<typeof updateLuckInputSchema>
