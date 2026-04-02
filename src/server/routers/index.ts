import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"
import { fplRouter } from "./fpl"

export const appRouter = createTRPCRouter({
  fpl: fplRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
