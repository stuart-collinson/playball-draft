import type { JSX } from "react"
import { SubPills } from "@pbd/components/layouts/RootLayout/SubPills"

type PageTitleRowProps = {
  title: string
}

export const PageTitleRow = ({ title }: PageTitleRowProps): JSX.Element => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <h1 className="text-xl font-bold text-foreground">{title}</h1>
    <SubPills />
  </div>
)
