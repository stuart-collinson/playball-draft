import { participantImageForSlug, participantLabelForSlug } from "@pbd/lib/people"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  slug: string
  className?: string
}

const initials = (label: string): string =>
  label
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

export const LuckPersonFace = ({ slug, className }: Props): JSX.Element => {
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
