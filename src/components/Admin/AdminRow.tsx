import type { JSX, ReactNode } from "react"

type Props = {
  leading: ReactNode
  title: string
  meta: string
  detail: string
  actions: ReactNode
}

export const AdminRow = ({ leading, title, meta, detail, actions }: Props): JSX.Element => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
    {leading}
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="truncate text-sm font-bold text-foreground">{title}</p>
      <p className="truncate text-xs text-muted-foreground">{meta}</p>
      <p className="truncate text-xs text-muted-foreground">{detail}</p>
    </div>
    <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
  </div>
)
