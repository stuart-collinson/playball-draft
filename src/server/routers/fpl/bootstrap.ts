import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { publicProcedure } from "@pbd/server/trpc"
import type { BootstrapStaticResponse } from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"

export const bootstrapProcedures = {
  bootstrapStatic: publicProcedure.query(
    (): Promise<BootstrapStaticResponse> =>
      fetchFpl(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
  ),
} satisfies TRPCRouterRecord
