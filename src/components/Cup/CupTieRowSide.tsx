import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { cn } from "@pbd/lib/className"
import { cupFeedersLabel } from "@pbd/lib/cups/labels"
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
  isMirrored: boolean
}

const NO_SCORE = "–"

const LEG_TO_COME = "TBC"

export const CupTieRowSide = ({
  person,
  feeders,
  legs,
  total,
  toPlay,
  isWinner,
  isDecided,
  isFinal,
  isMirrored,
}: Props): JSX.Element => {
  const showLegs = legs.length > 1 && legs.some((leg) => leg !== null)

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1",
        isMirrored && "flex-row-reverse",
        isDecided && !isWinner && "opacity-40",
      )}
    >
      {person ? (
        <PersonFace slug={person} className={cn("size-6 border-0 ring-0", isFinal && "size-9")} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-6 shrink-0 rounded-full border border-border border-dashed",
            isFinal && "size-9",
          )}
        />
      )}

      <span
        className={cn(
          "min-w-0 flex-1 truncate font-bold text-xs",
          isFinal && "text-sm",
          isMirrored && "text-right",
          !person && "font-medium text-muted-foreground",
        )}
      >
        {person ? participantLabelForSlug(person) : cupFeedersLabel(feeders)}
      </span>

      {showLegs && (
        <span className="shrink-0 text-[8px] text-muted-foreground leading-none tracking-tight tabular-nums">
          {legs.map((leg) => leg ?? LEG_TO_COME).join("+")}
        </span>
      )}

      {isWinner && isFinal && <Trophy aria-hidden className="size-3.5 shrink-0 text-amber-400" />}

      <span className={cn("flex shrink-0 flex-col", isMirrored ? "items-start" : "items-end")}>
        <span className={cn("font-black text-sm tabular-nums", isFinal && "text-lg")}>
          {total ?? NO_SCORE}
        </span>
        {toPlay !== null && toPlay > 0 && (
          <span className="text-[9px] text-muted-foreground">{toPlay} left</span>
        )}
      </span>
    </div>
  )
}
