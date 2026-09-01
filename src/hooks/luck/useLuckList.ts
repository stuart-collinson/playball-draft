import { luckListOptions } from "@pbd/hooks/luck/luck.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useLuckList = () => {
  const trpc = useTRPC()

  return useSuspenseQuery(luckListOptions(trpc))
}
