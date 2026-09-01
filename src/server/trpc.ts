import { requireGateAccess } from "@pbd/server/forfeits/gate"
import { initTRPC } from "@trpc/server"
import { ZodError } from "zod"

export type TRPCContext = {
  headers: Headers
}

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const publicProcedure = t.procedure

export const forfeitsViewProcedure = t.procedure.use(({ ctx, next }) => {
  requireGateAccess("view", ctx.headers)

  return next()
})

export const forfeitsUploadProcedure = t.procedure.use(({ ctx, next }) => {
  requireGateAccess("upload", ctx.headers)

  return next()
})
