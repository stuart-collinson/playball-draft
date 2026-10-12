import { cupDetailOptions } from "@pbd/hooks/cups/cups.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useCup = (cupId: string) => {
  const trpc = useTRPC()

  return useSuspenseQuery(cupDetailOptions(trpc, cupId))
}
