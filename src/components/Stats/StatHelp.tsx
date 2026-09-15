"use client"

import { Button } from "@pbd/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@pbd/components/ui/collapsible"
import { STAT_HELP } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import { ChevronDown, Info } from "lucide-react"
import type { JSX } from "react"

type Props = {
  stat: StatSlug
}

export const StatHelp = ({ stat }: Props): JSX.Element | null => {
  const paragraphs = STAT_HELP[stat]
  if (!paragraphs) return null

  return (
    <Collapsible className="group/help mb-6">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="-ml-2.5 text-muted-foreground">
          <Info />
          How it works
          <ChevronDown className="transition-transform group-data-[state=open]/help:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-2 pt-2">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-sm text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
