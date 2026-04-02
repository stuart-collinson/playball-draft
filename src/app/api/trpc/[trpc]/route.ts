import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"
import { appRouter } from "@pbd/server/routers/index"
import type { TRPCContext } from "@pbd/server/trpc"

const createContext = (req: NextRequest): TRPCContext => ({
  headers: req.headers,
  user: null,
})

const handler = (req: NextRequest): Promise<Response> =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  })

export { handler as GET, handler as POST }
