import { appRouter } from "@pbd/server/routers/index"
import type { TRPCContext } from "@pbd/server/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"

const createContext = (req: NextRequest): TRPCContext => ({
  headers: req.headers,
})

const handler = (req: NextRequest): Promise<Response> =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  })

export { handler as GET, handler as POST }
