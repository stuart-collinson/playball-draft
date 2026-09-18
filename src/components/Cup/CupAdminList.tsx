"use client"

import { CupAdminRow } from "@pbd/components/Cup/CupAdminRow"
import { CupCreateBlocked } from "@pbd/components/Cup/CupCreateBlocked"
import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { useCupScheduleWindow } from "@pbd/hooks/cups/useCupScheduleWindow"
import { useCupsList } from "@pbd/hooks/cups/useCupsList"
import type { JSX } from "react"

export const CupAdminList = (): JSX.Element => {
  const { data: cups } = useCupsList()
  const { data: window } = useCupScheduleWindow()

  return (
    <div className="flex flex-col gap-4">
      {!window.knockout && <CupCreateBlocked firstOpenGameweek={window.firstOpenGameweek} />}

      {cups.length === 0 ? (
        <EmptyState
          title="No active cup competitions"
          message="Nothing drawn yet. Use Create to set the first one running."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {cups.map((cup) => (
            <CupAdminRow key={cup.id} cup={cup} />
          ))}
        </div>
      )}
    </div>
  )
}
