import { Alert, AlertDescription, AlertTitle } from "@pbd/components/ui/alert"
import { CUP_MINIMUM_GAMEWEEKS } from "@pbd/lib/constants/Cups"
import { CalendarX } from "lucide-react"
import type { JSX } from "react"

type Props = {
  firstOpenGameweek: number | null
}

export const CupCreateBlocked = ({ firstOpenGameweek }: Props): JSX.Element => (
  <Alert>
    <CalendarX />
    <AlertTitle>No room for another cup</AlertTitle>
    <AlertDescription>
      {firstOpenGameweek === null
        ? "Every deadline this season has passed. The next cup will have to wait for the new one."
        : `A cup needs ${CUP_MINIMUM_GAMEWEEKS.knockout} game weeks and the earliest one still open is GW ${firstOpenGameweek}. There's nowhere left to put a final.`}
    </AlertDescription>
  </Alert>
)
