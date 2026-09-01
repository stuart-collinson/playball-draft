"use client"

import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { participantImageForSlug, participantLabelForSlug } from "@pbd/lib/people"
import { cn } from "@pbd/lib/utils/cn"
import type { RouterOutput } from "@pbd/types/api.types"
import { Clover } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type LuckMomentSummary = RouterOutput["luck"]["list"][number]

type Props = {
  moment: LuckMomentSummary
}

const LONG_STORY_THRESHOLD = 180

const initials = (label: string): string =>
  label
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

export const LuckMomentCard = ({ moment }: Props): JSX.Element => {
  const [isExpanded, setExpanded] = useState(false)

  const label = participantLabelForSlug(moment.person)
  const image = participantImageForSlug(moment.person)
  const isLongStory = moment.description.length > LONG_STORY_THRESHOLD

  return (
    <article className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {image ? (
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="font-bold text-muted-foreground text-xs">{initials(label)}</span>
          )}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-bold text-foreground text-sm">{label}</span>
          <span className="truncate text-muted-foreground text-xs">
            {LEAGUE_LABELS[moment.league]}
          </span>
        </div>
        <Clover size={16} className="ml-auto shrink-0 text-green-400" />
      </div>

      <h3 className="font-bold text-base text-foreground leading-snug">{moment.title}</h3>

      <p
        className={cn(
          "whitespace-pre-wrap text-foreground/80 text-sm leading-relaxed",
          isLongStory && !isExpanded && "line-clamp-3",
        )}
      >
        {moment.description}
      </p>

      {isLongStory && (
        <button
          type="button"
          onClick={() => setExpanded((expanded) => !expanded)}
          className="self-start font-semibold text-primary text-xs transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isExpanded ? "Show less" : "Full story"}
        </button>
      )}
    </article>
  )
}
