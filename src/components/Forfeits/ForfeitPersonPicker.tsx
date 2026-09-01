"use client"

import type { LeaguePerson } from "@pbd/lib/people"
import { cn } from "@pbd/lib/utils/cn"
import { Users } from "lucide-react"
import type { JSX } from "react"

type Props = {
  people: LeaguePerson[]
  selected: string | null
  onSelect: (person: string | null) => void
}

const FACE_BASE =
  "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 bg-muted transition-colors"

const FACE_ACTIVE = "border-primary"

const FACE_INACTIVE = "border-transparent"

const initials = (label: string): string =>
  label
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

export const ForfeitPersonPicker = ({ people, selected, onSelect }: Props): JSX.Element => (
  <section className="flex flex-col gap-2.5">
    <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.13em]">
      Person
    </h3>
    <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className="flex w-14 shrink-0 flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={cn(FACE_BASE, selected === null ? FACE_ACTIVE : FACE_INACTIVE)}>
          <Users size={18} className="text-muted-foreground" />
        </span>
        <span
          className={cn(
            "w-full truncate text-center text-[10px]",
            selected === null ? "font-bold text-foreground" : "text-muted-foreground",
          )}
        >
          Everyone
        </span>
      </button>
      {people.map((person) => (
        <button
          key={person.slug}
          type="button"
          aria-pressed={selected === person.slug}
          onClick={() => onSelect(person.slug)}
          className="flex w-14 shrink-0 flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={cn(FACE_BASE, selected === person.slug ? FACE_ACTIVE : FACE_INACTIVE)}>
            {person.image ? (
              <img
                src={person.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-bold text-muted-foreground text-xs">
                {initials(person.label)}
              </span>
            )}
          </span>
          <span
            className={cn(
              "w-full truncate text-center text-[10px]",
              selected === person.slug ? "font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {person.label}
          </span>
        </button>
      ))}
    </div>
  </section>
)
