import type { ReactNode } from "react"

export type PitchFlag = "amber" | "red"

export type PitchPlayer = {
  key: string
  name: ReactNode
  value: ReactNode
  club?: string
  flag?: PitchFlag
  label?: string
}

export type PitchRow = { key: string; players: PitchPlayer[] }
