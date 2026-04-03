import "server-only"

import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { headers } from "next/headers"
import { cache } from "react"
import type { JSX, ReactNode } from "react"
import { appRouter, type AppRouter } from "@pbd/server/routers/index"
import type { TRPCContext } from "@pbd/server/trpc"
import { makeQueryClient } from "@pbd/trpc/query-client"

const createContext = async (): Promise<TRPCContext> => ({
  headers: await headers(),
  user: null,
})

export const getQueryClient = cache(makeQueryClient)

export const api = createTRPCOptionsProxy<AppRouter>({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
})

type HydrateClientProps = {
  children: ReactNode
}

export const HydrateClient = ({ children }: HydrateClientProps): JSX.Element => (
  <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>
)
