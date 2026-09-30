import { cupScheduleWindowOptions } from "@pbd/hooks/cups/cups.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useCupScheduleWindow = () => {
  const trpc = useTRPC()

  return useSuspenseQuery(cupScheduleWindowOptions(trpc))
}
