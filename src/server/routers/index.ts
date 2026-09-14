import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"
import { forfeitsRouter } from "@pbd/server/routers/forfeits"
import { fplRouter } from "@pbd/server/routers/fpl"
import { luckRouter } from "@pbd/server/routers/luck"
import { survivalRouter } from "@pbd/server/routers/survival"

export const appRouter = createTRPCRouter({
  fpl: fplRouter,
  forfeits: forfeitsRouter,
  luck: luckRouter,
  survival: survivalRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
