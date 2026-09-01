"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LuckAdminRow } from "@pbd/components/Luck/LuckAdminRow"
import { useLuckList } from "@pbd/hooks/luck/useLuckList"
import type { JSX } from "react"

export const LuckAdminList = (): JSX.Element => {
  const { data: moments } = useLuckList()

  if (moments.length === 0)
    return (
      <EmptyState
        title="No Lucky Moments"
        message="Nothing recorded yet. Use Add lucky moment to start the archive."
      />
    )

  return (
    <div className="flex flex-col gap-2">
      {moments.map((moment) => (
        <LuckAdminRow key={moment.id} moment={moment} />
      ))}
    </div>
  )
}
