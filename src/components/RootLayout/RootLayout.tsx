import { BottomNavigation } from "@pbd/components/RootLayout/BottomNavigation"
import { Header } from "@pbd/components/RootLayout/Header"
import { isGateConfigured } from "@pbd/server/forfeits/gate"
import { prefetchHeaderQueries } from "@pbd/trpc/prefetch"
import { HydrateClient } from "@pbd/trpc/server"
import type { JSX, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const RootLayout = ({ children }: Props): JSX.Element => {
  void prefetchHeaderQueries()

  const showAccessKey = isGateConfigured("view") || isGateConfigured("upload")

  return (
    <div className="flex min-h-dvh flex-col">
      <HydrateClient>
        <Header showAccessKey={showAccessKey} />
      </HydrateClient>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24">{children}</main>
      <BottomNavigation />
    </div>
  )
}
