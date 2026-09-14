import { fetchBootstrapStatic } from "@pbd/server/fpl/bootstrap"
import { publicProcedure } from "@pbd/server/trpc"
import type { TRPCRouterRecord } from "@trpc/server"

export const bootstrapProcedures = {
  bootstrapStatic: publicProcedure.query(fetchBootstrapStatic),
} satisfies TRPCRouterRecord
