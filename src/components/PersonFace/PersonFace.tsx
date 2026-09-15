import { Avatar, AvatarFallback, AvatarImage } from "@pbd/components/ui/avatar"
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
    <Avatar className={cn("size-9 border ring-2 ring-card", className)}>
      {image && <AvatarImage src={image} alt="" loading="lazy" className="object-cover" />}
      <AvatarFallback className="text-xs font-bold">
        {personInitials(participantLabelForSlug(slug))}
      </AvatarFallback>
    </Avatar>
  )
}
