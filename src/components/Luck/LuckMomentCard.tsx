"use client"

import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { Button } from "@pbd/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@pbd/components/ui/card"
import { cn } from "@pbd/lib/className"
import { fmtDate } from "@pbd/lib/format"
import { peopleLabel } from "@pbd/lib/people"
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
    <Card className="min-w-0 flex-1 gap-2.5 rounded-2xl py-4">
      <CardHeader className="gap-2.5 px-4">
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
            <span className="truncate text-muted-foreground text-xs">
              {fmtDate(moment.createdAt)}
            </span>
          </div>
        </div>
        <CardTitle className="text-base font-bold leading-snug">{moment.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 px-4">
        <p
          className={cn(
            "whitespace-pre-wrap text-foreground/80 text-sm leading-relaxed",
            isLongStory && !isExpanded && "line-clamp-3",
          )}
        >
          {moment.description}
        </p>

        {isLongStory && (
          <Button
            variant="link"
            size="xs"
            aria-expanded={isExpanded}
            onClick={() => setExpanded((expanded) => !expanded)}
            className="h-auto self-start p-0 font-semibold"
          >
            {isExpanded ? "Show less" : "Full story"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
