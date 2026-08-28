import {
  FORFEIT_DESCRIPTION_MAX_LENGTH,
  FORFEIT_MEDIA_KINDS,
  FORFEIT_TITLE_MAX_LENGTH,
  MAX_FORFEIT_MEDIA_BYTES,
} from "@pbd/lib/constants/Forfeits"
import {
  forfeitPeople,
  isValidForfeitGameweek,
  isValidForfeitPair,
  resolveForfeitSelection,
} from "@pbd/lib/forfeits"
import { isForfeitBlobPath } from "@pbd/lib/forfeitsPaths"
import { z } from "zod"

const leagueSchema = z.enum(["premiership", "championship"])

const titleSchema = z.string().trim().min(1).max(FORFEIT_TITLE_MAX_LENGTH)

const personInLeague = (league: z.infer<typeof leagueSchema>, person: string): boolean =>
  forfeitPeople(league).some((candidate) => candidate.slug === person)

const customIssue = (ctx: z.RefinementCtx, path: string, message: string): void =>
  ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })

export const createForfeitInputSchema = z
  .object({
    league: leagueSchema,
    gameweek: z.string().min(1),
    type: z.string().min(1),
    subType: z.string().min(1).nullable(),
    person: z.string().min(1),
    title: titleSchema,
    description: z
      .string()
      .trim()
      .max(FORFEIT_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .transform((value) => (value ? value : null)),
    mediaKind: z.enum(FORFEIT_MEDIA_KINDS),
    mediaPath: z.string().refine(isForfeitBlobPath),
    thumbPath: z.string().refine(isForfeitBlobPath),
    mediaSizeBytes: z.number().int().positive().max(MAX_FORFEIT_MEDIA_BYTES),
  })
  .superRefine((input, ctx) => {
    if (!isValidForfeitPair(input.type, input.subType))
      customIssue(ctx, "subType", "That type and sub-type don't go together")
    if (!isValidForfeitGameweek(input.type, input.gameweek))
      customIssue(ctx, "gameweek", "That gameweek doesn't fit this forfeit")
    if (!personInLeague(input.league, input.person))
      customIssue(ctx, "person", "That person isn't in this league")
  })

export type CreateForfeitInput = z.infer<typeof createForfeitInputSchema>

export const updateForfeitInputSchema = z.object({
  id: z.string().uuid(),
  title: titleSchema,
  description: z
    .string()
    .trim()
    .max(FORFEIT_DESCRIPTION_MAX_LENGTH)
    .nullable()
    .transform((value) => (value ? value : null)),
})

export type UpdateForfeitInput = z.infer<typeof updateForfeitInputSchema>

export const forfeitDetailsSchema = z.object({
  title: titleSchema,
  description: z.string().trim().max(FORFEIT_DESCRIPTION_MAX_LENGTH),
})

export type ForfeitDetailsValues = z.infer<typeof forfeitDetailsSchema>

export const forfeitWizardSchema = z
  .object({
    league: leagueSchema,
    person: z.string().min(1, "Pick who did the forfeit"),
    gameweek: z.string().min(1, "Pick a gameweek"),
    selection: z.string().min(1, "Pick the forfeit"),
    title: titleSchema,
    description: z.string().trim().max(FORFEIT_DESCRIPTION_MAX_LENGTH),
  })
  .superRefine((draft, ctx) => {
    const selection = resolveForfeitSelection(draft.selection)
    if (!selection) {
      customIssue(ctx, "selection", "Pick the forfeit")
      return
    }

    if (!isValidForfeitGameweek(selection.type, draft.gameweek))
      customIssue(ctx, "gameweek", "That gameweek doesn't fit this forfeit")
    if (!personInLeague(draft.league, draft.person))
      customIssue(ctx, "person", "That person isn't in this league")
  })

export type ForfeitWizardValues = z.infer<typeof forfeitWizardSchema>
