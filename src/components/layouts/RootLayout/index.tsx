import type { JSX, ReactNode } from "react"
import { Header } from "./Header"

type RootLayoutProps = {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps): JSX.Element => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <div className="flex flex-1 flex-col">{children}</div>
  </div>
)
