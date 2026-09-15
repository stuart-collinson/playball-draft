import type { JSX, ReactNode } from "react"

type Props = {
  name: string
  club: string
  children?: ReactNode
}

export const PlayerLabel = ({ name, club, children }: Props): JSX.Element => (
  <span className="flex min-w-0 items-center gap-1.5">
    <span className="truncate">{name}</span>
    {club && <span className="shrink-0 text-xs font-normal text-muted-foreground">{club}</span>}
    {children}
  </span>
)
