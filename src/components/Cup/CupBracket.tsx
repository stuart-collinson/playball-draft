import { CupBracketPanels } from "@pbd/components/Cup/CupBracketPanels"
import { CupBracketWide } from "@pbd/components/Cup/CupBracketWide"
import type { CupLive } from "@pbd/lib/cups/live"
import type { CupFormat, CupSchedule, CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  ties: CupTie[]
  live: CupLive | null
}

export const CupBracket = ({ format, schedule, ties, live }: Props): JSX.Element => (
  <>
    <CupBracketPanels format={format} schedule={schedule} ties={ties} live={live} />
    <CupBracketWide format={format} schedule={schedule} ties={ties} live={live} />
  </>
)
