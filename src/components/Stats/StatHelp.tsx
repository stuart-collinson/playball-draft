import { STAT_HELP } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import type { JSX } from "react"

type Props = {
  stat: StatSlug
}

export const StatHelp = ({ stat }: Props): JSX.Element | null => {
  const paragraphs = STAT_HELP[stat]
  if (!paragraphs) return null

  return (
    <div className="mb-6 flex flex-col gap-2">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm text-muted-foreground">
          {paragraph}
        </p>
      ))}
    </div>
  )
}
