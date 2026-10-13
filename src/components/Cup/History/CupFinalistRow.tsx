import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { cn } from "@pbd/lib/className"
import { participantLabelForSlug } from "@pbd/lib/people"
import { Trophy } from "lucide-react"
import type { JSX } from "react"

type Props = {
  slug: string
  points: number
  isWinner: boolean
}

export const CupFinalistRow = ({ slug, points, isWinner }: Props): JSX.Element => (
  <div className={cn("flex items-center gap-2", !isWinner && "opacity-45")}>
    <PersonFace slug={slug} className="size-7 border-0 ring-0" />
    <span className="min-w-0 flex-1 truncate font-bold text-sm">
      {participantLabelForSlug(slug)}
    </span>
    {isWinner && <Trophy aria-hidden className="size-3.5 shrink-0 text-amber-400" />}
    <span className="shrink-0 font-black text-sm tabular-nums">{points}</span>
  </div>
)
