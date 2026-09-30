import { cupsRouter } from "@pbd/server/routers/cups"
import { forfeitsRouter } from "@pbd/server/routers/forfeits"
import { fplRouter } from "@pbd/server/routers/fpl"
import { luckRouter } from "@pbd/server/routers/luck"
import { survivalRouter } from "@pbd/server/routers/survival"
import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"

export const appRouter = createTRPCRouter({
  fpl: fplRouter,
  cups: cupsRouter,
  forfeits: forfeitsRouter,
  luck: luckRouter,
  survival: survivalRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
