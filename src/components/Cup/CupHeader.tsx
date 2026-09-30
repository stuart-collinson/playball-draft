import { cupFormatSeasonLabel } from "@pbd/lib/cups/labels"
import type { CupFormat } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  name: string
  season: string
  format: CupFormat
}

export const CupHeader = ({ name, season, format }: Props): JSX.Element => (
  <div className="flex min-w-0 flex-col">
    <span className="truncate font-bold text-base text-foreground">{name}</span>
    <span className="truncate text-muted-foreground text-xs">
      {cupFormatSeasonLabel(format, season)}
    </span>
  </div>
)
