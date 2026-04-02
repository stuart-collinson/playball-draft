import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@pbd/server/trpc"

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => ({
      greeting: `Hello, ${input.text ?? "world"}`,
    })),
})
