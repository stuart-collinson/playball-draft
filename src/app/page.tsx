import type { JSX } from "react"
import { Suspense } from "react"
import { HomeGreeting } from "@pbd/components/HomeGreeting/index"
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server"

export const dynamic = "force-dynamic"

const Page = async (): Promise<JSX.Element> => {
  void getQueryClient().prefetchQuery(api.example.hello.queryOptions({ text: "world" }))

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Playball Draft</h1>
        <Suspense fallback={<p className="text-brand-400">Loading greeting…</p>}>
          <HomeGreeting />
        </Suspense>
      </main>
    </HydrateClient>
  )
}

export default Page
