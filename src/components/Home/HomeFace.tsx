import type { OutcomeEntry } from "@pbd/lib/fpl/gameweekOutcome"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  person: OutcomeEntry | null
  className?: string
}

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

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
      <span className="text-xl font-black">{person ? initials(person.name) : "?"}</span>
    )}
  </span>
)
