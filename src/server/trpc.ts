import { initTRPC, TRPCError } from "@trpc/server"
import { ZodError } from "zod"

export type TRPCContext = {
  headers: Headers
  user: { id: string; email: string } | null
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

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.user === null) throw new TRPCError({ code: "UNAUTHORIZED" })

  return next({ ctx: { ...ctx, user: ctx.user } })
})
