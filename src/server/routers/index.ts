import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"
import { exampleRouter } from "./example"
import { fplRouter } from "./fpl"

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  fpl: fplRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
