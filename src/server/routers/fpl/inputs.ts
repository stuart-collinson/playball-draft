import { z } from "zod"

export const leagueIdInput = z.object({ leagueId: z.number().int().positive() })

// Duplicate ids would double-count every entry in the tallying procedures.
export const leagueIdsSchema = z
  .array(z.number().int().positive())
  .min(1)
  .refine((ids) => new Set(ids).size === ids.length, "leagueIds must be unique")

export const leagueIdsInput = z.object({ leagueIds: leagueIdsSchema })
