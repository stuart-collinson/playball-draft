import type { JSX } from "react"

type Props = {
  title: string
  message: string
}

export const EmptyState = ({ title, message }: Props): JSX.Element => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-10 text-center">
    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
    <p className="text-xs text-muted-foreground">{message}</p>
  </div>
)
