import { cupsListOptions } from "@pbd/hooks/cups/cups.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useCupsList = () => {
  const trpc = useTRPC()

  return useSuspenseQuery(cupsListOptions(trpc))
}
