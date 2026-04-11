import type { Metadata } from "next"
import type { JSX, ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"
import { RootLayout } from "@pbd/components/layouts/RootLayout/index"
import { APP_NAME } from "@pbd/lib/constants/app"
import { TRPCReactProvider } from "@pbd/trpc/react"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Fantasy Premier League Draft League dashboard",
}

type LayoutProps = {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps): JSX.Element => (
  <html lang="en" className="dark" suppressHydrationWarning>
    <body className="bg-background text-foreground antialiased">
      <TRPCReactProvider>
        <RootLayout>{children}</RootLayout>
      </TRPCReactProvider>
      <Analytics />
    </body>
  </html>
)

export default Layout
