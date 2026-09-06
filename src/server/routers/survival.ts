import { isDatabaseConfigured } from "@pbd/server/db"
import { resolveSurvivalStreaks } from "@pbd/server/survival/streaks"
import { createTRPCRouter, publicProcedure } from "@pbd/server/trpc"
import { TRPCError } from "@trpc/server"

export const survivalRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    if (!isDatabaseConfigured()) throw new TRPCError({ code: "NOT_FOUND" })

    return resolveSurvivalStreaks()
  }),
})
