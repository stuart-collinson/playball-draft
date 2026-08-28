"use client"

import { FORFEIT_FILTER_PARAMS } from "@pbd/hooks/forfeits/useForfeitFilters"
import { isWildcardSubTypeSlug } from "@pbd/lib/forfeits"
import { useSearchParams } from "next/navigation"

export type ForfeitFilterActions = {
  selectForfeit: (slug: string | null) => void
  selectGameweek: (gameweek: string | null) => void
  selectPerson: (person: string | null) => void
  clearFilters: () => void
}

const WILDCARD_TYPE = "wildcard"

export const useForfeitFilterActions = (): ForfeitFilterActions => {
  const searchParams = useSearchParams()

  const pushParams = (params: URLSearchParams): void => {
    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  const withParams = (mutate: (params: URLSearchParams) => void): void => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    pushParams(params)
  }

  const setParam = (key: string, value: string | null): void =>
    withParams((params) => {
      if (value === null) params.delete(key)
      else params.set(key, value)
    })

  const selectForfeit = (slug: string | null): void =>
    withParams((params) => {
      params.delete(FORFEIT_FILTER_PARAMS.type)
      params.delete(FORFEIT_FILTER_PARAMS.subType)

      if (slug === null) return

      if (isWildcardSubTypeSlug(slug)) {
        params.set(FORFEIT_FILTER_PARAMS.type, WILDCARD_TYPE)
        params.set(FORFEIT_FILTER_PARAMS.subType, slug)
        return
      }

      params.set(FORFEIT_FILTER_PARAMS.type, slug)
    })

  const clearFilters = (): void =>
    withParams((params) => {
      params.delete(FORFEIT_FILTER_PARAMS.gameweek)
      params.delete(FORFEIT_FILTER_PARAMS.type)
      params.delete(FORFEIT_FILTER_PARAMS.subType)
      params.delete(FORFEIT_FILTER_PARAMS.person)
    })

  return {
    selectForfeit,
    selectGameweek: (gameweek) => setParam(FORFEIT_FILTER_PARAMS.gameweek, gameweek),
    selectPerson: (person) => setParam(FORFEIT_FILTER_PARAMS.person, person),
    clearFilters,
  }
}
