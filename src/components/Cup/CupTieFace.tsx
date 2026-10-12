import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Props = {
  person: string | null
  isFinal: boolean
}

export const CupTieFace = ({ person, isFinal }: Props): JSX.Element =>
  person ? (
    <PersonFace slug={person} className={cn("size-6 border-0 ring-0", isFinal && "size-9")} />
  ) : (
    <span
      aria-hidden
      className={cn(
        "size-6 shrink-0 rounded-full border border-border border-dashed",
        isFinal && "size-9",
      )}
    />
  )
