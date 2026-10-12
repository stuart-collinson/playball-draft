import { CupTieFace } from "@pbd/components/Cup/CupTieFace"
import { cn } from "@pbd/lib/className"
import { CUP_LEG_TO_COME, CUP_NO_SCORE } from "@pbd/lib/constants/Cups"
import { cupFeedersLabel, cupToPlayLabel } from "@pbd/lib/cups/labels"
import { participantLabelForSlug } from "@pbd/lib/people"
import { Trophy } from "lucide-react"
import type { JSX } from "react"

type Props = {
  person: string | null
  feeders: string[]
  legs: (number | null)[]
  total: number | null
  toPlay: number | null
  isWinner: boolean
  isDecided: boolean
  isFinal: boolean
}

export const CupTieSide = ({
  person,
  feeders,
  legs,
  total,
  toPlay,
  isWinner,
  isDecided,
  isFinal,
}: Props): JSX.Element => {
  const showLegs = legs.length > 1 && legs.some((leg) => leg !== null)

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5",
        isFinal && "gap-2.5 px-3 py-3.5",
        isWinner && "bg-primary/10",
        isWinner && isFinal && "bg-amber-400/10",
        isDecided && !isWinner && "opacity-40",
      )}
    >
      <CupTieFace person={person} isFinal={isFinal} />

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate font-bold text-xs",
            isFinal && "text-sm",
            !person && "font-medium text-muted-foreground",
          )}
        >
          {person ? participantLabelForSlug(person) : cupFeedersLabel(feeders)}
        </span>
        {showLegs && (
          <span
            className={cn(
              "truncate text-[10px] text-muted-foreground tabular-nums",
              isFinal && "text-xs",
            )}
          >
            {legs.map((leg) => leg ?? CUP_LEG_TO_COME).join(" + ")}
          </span>
        )}
      </div>

      {isWinner && isFinal && <Trophy aria-hidden className="size-4 shrink-0 text-amber-400" />}

      <div className="flex shrink-0 flex-col items-end">
        <span className={cn("font-black text-sm tabular-nums", isFinal && "text-lg")}>
          {total ?? CUP_NO_SCORE}
        </span>
        {toPlay !== null && toPlay > 0 && (
          <span className={cn("text-[10px] text-muted-foreground", isFinal && "text-xs")}>
            {cupToPlayLabel(toPlay)}
          </span>
        )}
      </div>
    </div>
  )
}
