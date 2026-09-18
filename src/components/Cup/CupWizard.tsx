"use client"

import { CupCreateBlocked } from "@pbd/components/Cup/CupCreateBlocked"
import { CupWizardForm } from "@pbd/components/Cup/CupWizardForm"
import { useCupScheduleWindow } from "@pbd/hooks/cups/useCupScheduleWindow"
import type { JSX } from "react"

export const CupWizard = (): JSX.Element => {
  const { data: window } = useCupScheduleWindow()

  if (!window.knockout || window.firstOpenGameweek === null)
    return <CupCreateBlocked firstOpenGameweek={window.firstOpenGameweek} />

  return (
    <CupWizardForm firstOpenGameweek={window.firstOpenGameweek} allowTwoLegs={window.twoLegs} />
  )
}
