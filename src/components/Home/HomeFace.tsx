import { cn } from "@pbd/lib/className"
import type { OutcomeEntry } from "@pbd/lib/fpl/gameweekOutcome"
import { personInitials } from "@pbd/lib/people"
import type { JSX } from "react"

type Props = {
  person: OutcomeEntry | null
  className?: string
}

export const HomeFace = ({ person, className }: Props): JSX.Element => (
  <span
    className={cn(
      "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-current bg-black/20",
      className,
    )}
  >
    {person?.image ? (
      <img src={person.image} alt="" className="h-full w-full object-cover" />
    ) : (
      <span className="text-xl font-black">{person ? personInitials(person.name) : "?"}</span>
    )}
  </span>
)
