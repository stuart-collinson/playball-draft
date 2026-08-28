import { forfeitDetailOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useForfeitDetail = (id: string) => {
  const trpc = useTRPC()

  return useSuspenseQuery(forfeitDetailOptions(trpc, id))
}
