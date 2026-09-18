"use client"

import { Button } from "@pbd/components/ui/button"
import { useCupScheduleWindow } from "@pbd/hooks/cups/useCupScheduleWindow"
import { ADD_CUP_HREF } from "@pbd/lib/constants/Pages"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

export const CupCreateButton = (): JSX.Element | null => {
  const { data: window } = useCupScheduleWindow()

  if (!window.knockout) return null

  return (
    <Button size="sm" variant="secondary" asChild>
      <Link href={ADD_CUP_HREF}>
        <Plus />
        Create
      </Link>
    </Button>
  )
}
