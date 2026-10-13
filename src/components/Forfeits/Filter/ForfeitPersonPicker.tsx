"use client"

import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { Avatar, AvatarFallback } from "@pbd/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import type { LeaguePerson } from "@pbd/lib/people"
import { Users } from "lucide-react"
import type { JSX } from "react"

type Props = {
  people: LeaguePerson[]
  selected: string | null
  onSelect: (person: string | null) => void
}

const EVERYONE = "everyone"

const PERSON_CLASSES =
  "group/person h-auto w-14 shrink-0 flex-col gap-1.5 rounded-lg bg-transparent px-0 hover:bg-transparent data-[state=on]:bg-transparent"

const FACE_CLASSES =
  "size-12 border-2 border-transparent ring-0 transition-colors group-data-[state=on]/person:border-primary"

const LABEL_CLASSES =
  "w-full truncate text-center text-[10px] font-medium text-muted-foreground group-data-[state=on]/person:font-bold group-data-[state=on]/person:text-foreground"

export const ForfeitPersonPicker = ({ people, selected, onSelect }: Props): JSX.Element => (
  <section className="flex flex-col gap-2.5">
    <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.13em]">
      Person
    </h3>
    <ToggleGroup
      type="single"
      value={selected ?? EVERYONE}
      onValueChange={(value) => onSelect(value === EVERYONE || value === "" ? null : value)}
      spacing={3}
      aria-label="Person"
      className="-mx-5 w-auto justify-start overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ToggleGroupItem value={EVERYONE} className={PERSON_CLASSES}>
        <Avatar className={`${FACE_CLASSES} bg-muted`}>
          <AvatarFallback>
            <Users size={18} className="text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <span className={LABEL_CLASSES}>Everyone</span>
      </ToggleGroupItem>

      {people.map((person) => (
        <ToggleGroupItem key={person.slug} value={person.slug} className={PERSON_CLASSES}>
          <PersonFace slug={person.slug} className={FACE_CLASSES} />
          <span className={LABEL_CLASSES}>{person.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </section>
)
