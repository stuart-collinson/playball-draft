import { cn } from "@pbd/lib/className"
import { participantImageForSlug, participantLabelForSlug, personInitials } from "@pbd/lib/people"
import type { JSX } from "react"

type Props = {
  slug: string
  className?: string
}

export const PersonFace = ({ slug, className }: Props): JSX.Element => {
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
          {personInitials(participantLabelForSlug(slug))}
        </span>
      )}
    </span>
  )
}
