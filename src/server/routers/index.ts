import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"
import { forfeitsRouter } from "./forfeits"
import { fplRouter } from "./fpl"

export const appRouter = createTRPCRouter({
  fpl: fplRouter,
  forfeits: forfeitsRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
