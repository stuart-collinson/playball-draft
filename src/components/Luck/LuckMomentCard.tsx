"use client"

import { LuckPersonFace } from "@pbd/components/Luck/LuckPersonFace"
import { peopleLabel } from "@pbd/lib/people"
import { cn } from "@pbd/lib/utils/cn"
import { fmtDate } from "@pbd/lib/utils/fmt"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"
import { useState } from "react"

type LuckMomentSummary = RouterOutput["luck"]["list"][number]

type Props = {
  moment: LuckMomentSummary
}

const LONG_STORY_THRESHOLD = 180

export const LuckMomentCard = ({ moment }: Props): JSX.Element => {
  const [isExpanded, setExpanded] = useState(false)

  const isLongStory = moment.description.length > LONG_STORY_THRESHOLD

  return (
    <article className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex shrink-0">
          {moment.people.map((slug, index) => (
            <LuckPersonFace key={slug} slug={slug} className={index > 0 ? "-ml-3" : undefined} />
          ))}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-bold text-foreground text-sm">
            {peopleLabel(moment.people)}
          </span>
          <span className="truncate text-muted-foreground text-xs">
            {fmtDate(moment.createdAt)}
          </span>
        </div>
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
          aria-expanded={isExpanded}
          onClick={() => setExpanded((expanded) => !expanded)}
          className="self-start font-semibold text-primary text-xs transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isExpanded ? "Show less" : "Full story"}
        </button>
      )}
    </article>
  )
}
