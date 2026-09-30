import { CUP_ROUNDS } from "@pbd/lib/constants/Cups"
import { buildCupSlots } from "@pbd/lib/cups/bracket"
import { createDrawSeed, cupEntrants, shuffleWithSeed } from "@pbd/lib/cups/draw"
import { canCreateCup, lockedCupRounds } from "@pbd/lib/cups/schedule"
import { createCupInputSchema, cupScheduleFrom, updateCupInputSchema } from "@pbd/lib/cups/schema"
import { archiveCup, findCup, insertCup, updateCup } from "@pbd/server/cups/repository"
import {
  resolveCupDetail,
  resolveCupSummaries,
  resolveFirstOpenGameweek,
  resolveScheduleWindow,
} from "@pbd/server/cups/tree"
import { isDatabaseConfigured } from "@pbd/server/db"
import { adminProcedure, createTRPCRouter, publicProcedure } from "@pbd/server/trpc"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

const NOT_ENOUGH_GAMEWEEKS = "There aren't enough game weeks left in the season for a cup."

const ROUND_ALREADY_STARTED = "A round that has already started can't be moved."

const ROUND_IN_THE_PAST = "A round can't be moved into a game week that has already kicked off."

const FORMAT_IS_FROZEN = "A cup's format can't change once the draw has been made."

const badRequest = (message: string): TRPCError => new TRPCError({ code: "BAD_REQUEST", message })

const cupIdInput = z.object({ cupId: z.string().uuid() })

export const cupsRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    if (!isDatabaseConfigured()) throw new TRPCError({ code: "NOT_FOUND" })

    return resolveCupSummaries()
  }),

  detail: publicProcedure.input(cupIdInput).query(async ({ input }) => {
    if (!isDatabaseConfigured()) throw new TRPCError({ code: "NOT_FOUND" })

    const cup = await resolveCupDetail(input.cupId)
    if (!cup) throw new TRPCError({ code: "NOT_FOUND" })

    return cup
  }),

  scheduleWindow: adminProcedure.query(() => resolveScheduleWindow()),

  create: adminProcedure.input(createCupInputSchema).mutation(async ({ input }) => {
    const firstOpenGameweek = await resolveFirstOpenGameweek()
    if (!canCreateCup(input.format, firstOpenGameweek)) throw badRequest(NOT_ENOUGH_GAMEWEEKS)

    const schedule = cupScheduleFrom(input)
    if (firstOpenGameweek === null || schedule.round_of_16 < firstOpenGameweek)
      throw badRequest(ROUND_IN_THE_PAST)

    const drawSeed = createDrawSeed()
    const entrants = cupEntrants()

    const id = await insertCup({
      name: input.name.trim(),
      format: input.format,
      schedule,
      drawSeed,
      drawEntrants: entrants,
      slots: buildCupSlots(shuffleWithSeed(entrants, drawSeed)),
    })

    return { id }
  }),

  update: adminProcedure.input(updateCupInputSchema).mutation(async ({ input }) => {
    const cup = await findCup(input.id)
    if (!cup) throw new TRPCError({ code: "NOT_FOUND" })
    if (cup.format !== input.format) throw badRequest(FORMAT_IS_FROZEN)

    const schedule = cupScheduleFrom(input)
    const moved = CUP_ROUNDS.filter((round) => schedule[round] !== cup.schedule[round])

    if (moved.length > 0) {
      const firstOpenGameweek = await resolveFirstOpenGameweek()
      const locked = lockedCupRounds(cup.schedule, firstOpenGameweek)

      if (moved.some((round) => locked.includes(round))) throw badRequest(ROUND_ALREADY_STARTED)
      if (firstOpenGameweek === null || moved.some((round) => schedule[round] < firstOpenGameweek))
        throw badRequest(ROUND_IN_THE_PAST)
    }

    const updated = await updateCup({ id: input.id, name: input.name.trim(), schedule })
    if (!updated) throw new TRPCError({ code: "NOT_FOUND" })

    return { id: input.id }
  }),

  remove: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    const archived = await archiveCup(input.id)
    if (!archived) throw new TRPCError({ code: "NOT_FOUND" })

    return { id: input.id }
  }),
})
