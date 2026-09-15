import type { ReactNode } from "react"

export type ManagerTableColumn = {
  key: string
  header: string
  align?: "right" | "center"
  emphasis?: "primary" | "muted"
  className?: string
}

export type ManagerTableRow = {
  key: string
  rank: number
  lastRank?: number
  entryApiId: number
  leagueId: number
  managerName: string
  teamName?: string
  title?: ReactNode
  subtitle?: ReactNode
  detail?: ReactNode
  cells: Record<string, ReactNode>
}
