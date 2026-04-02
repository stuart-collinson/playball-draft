import type { JSX, ReactNode } from "react"
import { Header } from "./Header"

type RootLayoutProps = {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps): JSX.Element => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
  </div>
)
