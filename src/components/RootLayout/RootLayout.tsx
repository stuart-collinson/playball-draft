import { BottomNavigation } from "@pbd/components/RootLayout/BottomNavigation"
import { Header } from "@pbd/components/RootLayout/Header"
import type { JSX, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const RootLayout = ({ children }: Props): JSX.Element => (
  <div className="flex min-h-dvh flex-col">
    <Header />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24">{children}</main>
    <BottomNavigation />
  </div>
)
