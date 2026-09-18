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
}

const NO_SCORE = "–"

const LEG_TO_COME = "TBC"

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
            {legs.map((leg) => leg ?? LEG_TO_COME).join(" + ")}
          </span>
        )}
      </div>

      {isWinner && isFinal && <Trophy aria-hidden className="size-4 shrink-0 text-amber-400" />}

      <div className="flex shrink-0 flex-col items-end">
        <span className={cn("font-black text-sm tabular-nums", isFinal && "text-lg")}>
          {total ?? NO_SCORE}
        </span>
        {toPlay !== null && toPlay > 0 && (
          <span className={cn("text-[10px] text-muted-foreground", isFinal && "text-xs")}>
            {toPlay} to play
          </span>
        )}
      </div>
    </div>
  )
}
