import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@pbd/components/ui/empty"
import type { JSX } from "react"

type Props = {
  title: string
  message: string
}

export const EmptyState = ({ title, message }: Props): JSX.Element => (
  <Empty className="rounded-2xl border border-dashed bg-card/40 py-10 md:py-12">
    <EmptyHeader>
      <EmptyTitle className="text-base">{title}</EmptyTitle>
      <EmptyDescription>{message}</EmptyDescription>
    </EmptyHeader>
  </Empty>
)
