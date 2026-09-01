"use client"

import {
  participantImageForSlug,
  participantLabelForSlug,
  peopleLabel,
  peopleLeaguesLabel,
} from "@pbd/lib/people"
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

const PersonFace = ({ slug, className }: { slug: string; className?: string }): JSX.Element => {
  const image = participantImageForSlug(slug)

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted ring-2 ring-card",
        className,
      )}
    >
      {image ? (
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="font-bold text-muted-foreground text-xs">
          {initials(participantLabelForSlug(slug))}
        </span>
      )}
    </span>
  )
}

export const LuckMomentCard = ({ moment }: Props): JSX.Element => {
  const [isExpanded, setExpanded] = useState(false)

  const isLongStory = moment.description.length > LONG_STORY_THRESHOLD
  const leagues = peopleLeaguesLabel(moment.people)

  return (
    <article className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex shrink-0">
          {moment.people.map((slug, index) => (
            <PersonFace key={slug} slug={slug} className={index > 0 ? "-ml-3" : undefined} />
          ))}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-bold text-foreground text-sm">
            {peopleLabel(moment.people)}
          </span>
          {leagues && <span className="truncate text-muted-foreground text-xs">{leagues}</span>}
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
