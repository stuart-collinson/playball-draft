import { createCallerFactory, createTRPCRouter } from "@pbd/server/trpc"
import { exampleRouter } from "./example"

export const appRouter = createTRPCRouter({
  example: exampleRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
