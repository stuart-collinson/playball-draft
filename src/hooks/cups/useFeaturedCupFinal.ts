import { cupDetailOptions, cupsListOptions } from "@pbd/hooks/cups/cups.cache"
import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { featuredFinalCup } from "@pbd/lib/cups/final"
import { useTRPC } from "@pbd/trpc/react"
import type { ResolvedCup } from "@pbd/types/cups.types"
import { useQuery } from "@tanstack/react-query"

type FeaturedCupFinal = {
  cup: ResolvedCup | null
  isLoading: boolean
  isError: boolean
}

const NO_CUP_ID = ""

export const useFeaturedCupFinal = (gameweek: number): FeaturedCupFinal => {
  const trpc = useTRPC()
  const list = useQuery(cupsListOptions(trpc))
  const featured = list.data ? featuredFinalCup(list.data, CURRENT_SEASON, gameweek) : null
  const detail = useQuery({
    ...cupDetailOptions(trpc, featured?.id ?? NO_CUP_ID),
    enabled: featured !== null,
  })

  return {
    cup: detail.data ?? null,
    isLoading: list.isPending || (featured !== null && detail.isPending),
    isError: list.isError || detail.isError,
  }
}
