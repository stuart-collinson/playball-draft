import { forfeitsForGameweekOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import type { GameweekForfeit } from "@pbd/lib/homeScreen"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useGameweekForfeits = (
  gameweek: number | null,
  canView: boolean,
): GameweekForfeit[] | null => {
  const trpc = useTRPC()
  const { data } = useQuery({
    ...forfeitsForGameweekOptions(trpc, String(gameweek ?? 0)),
    enabled: canView && gameweek !== null,
  })

  if (!canView || !data) return null

  return data.items.map(({ id, person, league, title }) => ({ id, person, league, title }))
}
