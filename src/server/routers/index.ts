import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"
import { forfeitsRouter } from "./forfeits"
import { fplRouter } from "./fpl"
import { luckRouter } from "./luck"

export const appRouter = createTRPCRouter({
  fpl: fplRouter,
  forfeits: forfeitsRouter,
  luck: luckRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
