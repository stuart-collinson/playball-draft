"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { JSX, ReactNode } from "react"
import { useState } from "react"
import type { AppRouter } from "@pbd/server/routers/index"
import { makeQueryClient } from "@pbd/trpc/query-client"

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient | undefined

const getQueryClient = (): QueryClient => {
  if (typeof window === "undefined") return makeQueryClient()
  if (browserQueryClient === undefined) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

type TRPCReactProviderProps = {
  children: ReactNode
}

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") return ""
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const TRPCReactProvider = ({ children }: TRPCReactProviderProps): JSX.Element => {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchStreamLink({ url: `${getBaseUrl()}/api/trpc` })],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
