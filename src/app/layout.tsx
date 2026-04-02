import type { Metadata } from "next"
import type { JSX, ReactNode } from "react"
import { RootLayout } from "@pbd/components/layouts/RootLayout/index"
import { APP_NAME } from "@pbd/lib/constants/app"
import { TRPCReactProvider } from "@pbd/trpc/react"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Built with Next.js 15 + tRPC v11",
}

type LayoutProps = {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps): JSX.Element => (
  <html lang="en" suppressHydrationWarning>
    <body>
      <TRPCReactProvider>
        <RootLayout>{children}</RootLayout>
      </TRPCReactProvider>
    </body>
  </html>
)

export default Layout
