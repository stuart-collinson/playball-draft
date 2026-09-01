import { LUCK_DESCRIPTION_MAX_LENGTH, LUCK_TITLE_MAX_LENGTH } from "@pbd/lib/constants/Luck"
import { isGameweekValue } from "@pbd/lib/gameweeks"
import { leaguePeople } from "@pbd/lib/people"
import { z } from "zod"

export const MAX_LUCK_PEOPLE = 2

const titleSchema = z.string().trim().min(1, "Give it a title").max(LUCK_TITLE_MAX_LENGTH)

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Tell the story")
  .max(LUCK_DESCRIPTION_MAX_LENGTH)

const customIssue = (ctx: z.RefinementCtx, path: string, message: string): void =>
  ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })

const isKnownPerson = (slug: string): boolean =>
  leaguePeople("combined").some((candidate) => candidate.slug === slug)

export const createLuckInputSchema = z
  .object({
    gameweek: z.string().min(1, "Pick a game week"),
    people: z
      .array(z.string().min(1))
      .min(1, "Pick who got lucky")
      .max(MAX_LUCK_PEOPLE, "No more than two people"),
    title: titleSchema,
    description: descriptionSchema,
  })
  .superRefine((input, ctx) => {
    if (!isGameweekValue(input.gameweek))
      customIssue(ctx, "gameweek", "That game week doesn't exist")
    if (new Set(input.people).size !== input.people.length)
      customIssue(ctx, "people", "The same person is picked twice")
    if (!input.people.every(isKnownPerson))
      customIssue(ctx, "people", "Someone picked isn't in either league")
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
