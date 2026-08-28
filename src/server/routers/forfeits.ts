import { decodeForfeitsCursor, encodeForfeitsCursor } from "@pbd/lib/forfeitsCursor"
import { createForfeitInputSchema } from "@pbd/lib/forfeitsSchema"
import { signForfeitMediaUrl } from "@pbd/server/forfeits/media"
import { getForfeitById, insertForfeit, listForfeits } from "@pbd/server/forfeits/repository"
import { createTRPCRouter, forfeitsUploadProcedure, forfeitsViewProcedure } from "@pbd/server/trpc"
import type { Forfeit } from "@pbd/types/forfeits.types"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

const FORFEITS_PAGE_SIZE = 12

const listInputSchema = z.object({
  league: z.enum(["premiership", "championship"]).nullish(),
  cadence: z.enum(["weekly", "annual"]).default("weekly"),
  gameweek: z.string().min(1).nullish(),
  type: z.string().min(1).nullish(),
  subType: z.string().min(1).nullish(),
  person: z.string().min(1).nullish(),
  cursor: z.string().nullish(),
})

const toSummary = async (forfeit: Forfeit) => ({
  id: forfeit.id,
  season: forfeit.season,
  gameweek: forfeit.gameweek,
  league: forfeit.league,
  type: forfeit.type,
  subType: forfeit.subType,
  person: forfeit.person,
  title: forfeit.title,
  archive: forfeit.archive,
  createdAt: forfeit.createdAt,
  thumbUrl: await signForfeitMediaUrl(forfeit.thumbPath),
})

export const forfeitsRouter = createTRPCRouter({
  list: forfeitsViewProcedure.input(listInputSchema).query(async ({ input }) => {
    const cursor = input.cursor ? decodeForfeitsCursor(input.cursor) : null
    const forfeits = await listForfeits(
      {
        league: input.league ?? null,
        cadence: input.cadence,
        gameweek: input.gameweek ?? null,
        type: input.type ?? null,
        subType: input.subType ?? null,
        person: input.person ?? null,
      },
      cursor,
      FORFEITS_PAGE_SIZE + 1,
    )

    const page = forfeits.slice(0, FORFEITS_PAGE_SIZE)
    const lastOnPage = page[page.length - 1]
    const hasMore = forfeits.length > FORFEITS_PAGE_SIZE && lastOnPage !== undefined

    return {
      items: await Promise.all(page.map(toSummary)),
      nextCursor: hasMore
        ? encodeForfeitsCursor({ createdAt: lastOnPage.createdAt, id: lastOnPage.id })
        : null,
    }
  }),

  detail: forfeitsViewProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const forfeit = await getForfeitById(input.id)
      if (!forfeit) throw new TRPCError({ code: "NOT_FOUND" })

      return {
        ...(await toSummary(forfeit)),
        description: forfeit.description,
        mediaKind: forfeit.mediaKind,
        mediaSizeBytes: forfeit.mediaSizeBytes,
        mediaUrl: await signForfeitMediaUrl(forfeit.mediaPath),
      }
    }),

  create: forfeitsUploadProcedure.input(createForfeitInputSchema).mutation(async ({ input }) => {
    const forfeit = await insertForfeit(input)
    return { id: forfeit.id }
  }),
})
