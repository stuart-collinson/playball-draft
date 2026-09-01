import { createLuckInputSchema, updateLuckInputSchema } from "@pbd/lib/luckSchema"
import {
  deleteLuckMomentById,
  insertLuckMoment,
  listLuckMoments,
  updateLuckMomentDetails,
} from "@pbd/server/luck/repository"
import { adminProcedure, createTRPCRouter, publicProcedure } from "@pbd/server/trpc"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

export const luckRouter = createTRPCRouter({
  list: publicProcedure.query(async () => listLuckMoments()),

  create: adminProcedure.input(createLuckInputSchema).mutation(async ({ input }) => {
    const moment = await insertLuckMoment(input)
    return { id: moment.id }
  }),

  update: adminProcedure.input(updateLuckInputSchema).mutation(async ({ input }) => {
    const moment = await updateLuckMomentDetails(input)
    if (!moment) throw new TRPCError({ code: "NOT_FOUND" })

    return { id: moment.id }
  }),

  remove: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    const deleted = await deleteLuckMomentById(input.id)
    if (!deleted) throw new TRPCError({ code: "NOT_FOUND" })

    return { id: input.id }
  }),
})
