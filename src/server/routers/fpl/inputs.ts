import { z } from "zod"

export const leagueIdInput = z.object({ leagueId: z.number().int().positive() })

export const leagueIdsInput = z.object({
  leagueIds: z.array(z.number().int().positive()).min(1),
})
