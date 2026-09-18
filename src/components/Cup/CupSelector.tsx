"use client"

import { CupSelectorCard } from "@pbd/components/Cup/CupSelectorCard"
import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { useCupsList } from "@pbd/hooks/cups/useCupsList"
import type { JSX } from "react"

export const CupSelector = (): JSX.Element => {
  const { data: cups } = useCupsList()
  const running = cups.filter((cup) => cup.status === "running")

  if (running.length === 0)
    return (
      <EmptyState
        title="No Cup Running"
        message="Nothing on at the minute. Previous cups are behind the History button."
      />
    )

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {running.map((cup) => (
        <CupSelectorCard key={cup.id} cup={cup} />
      ))}
    </div>
  )
}
