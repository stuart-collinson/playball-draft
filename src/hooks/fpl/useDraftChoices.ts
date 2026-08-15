import { draftChoicesOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useDraftChoices = (leagueId: number) => {
  const trpc = useTRPC()

  return useSuspenseQuery(draftChoicesOptions(trpc, leagueId))
}
