"use client"

import { Button } from "@pbd/components/ui/Button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select"
import { FORFEIT_FILTER_PARAMS, useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { forfeitDisplayLabel, forfeitPeople, isWildcardSubTypeSlug } from "@pbd/lib/forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

type Props = {
  scope: LeagueScope
}

const ALL = "all"

const WILDCARD_TYPE = "wildcard"

type ForfeitOption = {
  value: string
  label: string
}

const forfeitOptionsFor = (cadence: ForfeitCadence): ForfeitOption[] =>
  FORFEIT_TYPES.filter((forfeitType) => forfeitType.category === cadence).flatMap(
    (forfeitType): ForfeitOption[] =>
      forfeitType.slug === WILDCARD_TYPE
        ? [
            { value: forfeitType.slug, label: forfeitType.label },
            ...WILDCARD_SUB_TYPES.map((outcome) => ({
              value: outcome.slug,
              label: forfeitDisplayLabel(WILDCARD_TYPE, outcome.slug),
            })),
          ]
        : [{ value: forfeitType.slug, label: forfeitType.label }],
  )

export const ForfeitsFilterBar = ({ scope }: Props): JSX.Element => {
  const searchParams = useSearchParams()
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()
  const { data: gameState } = useGameState()

  const pushParams = (params: URLSearchParams): void => {
    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  const setParam = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)

    pushParams(params)
  }

  const selectForfeit = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(FORFEIT_FILTER_PARAMS.type)
    params.delete(FORFEIT_FILTER_PARAMS.subType)

    if (isWildcardSubTypeSlug(value)) {
      params.set(FORFEIT_FILTER_PARAMS.type, WILDCARD_TYPE)
      params.set(FORFEIT_FILTER_PARAMS.subType, value)
    } else if (value !== ALL) params.set(FORFEIT_FILTER_PARAMS.type, value)

    pushParams(params)
  }

  const resetFilters = (): void => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(FORFEIT_FILTER_PARAMS.gameweek)
    params.delete(FORFEIT_FILTER_PARAMS.type)
    params.delete(FORFEIT_FILTER_PARAMS.subType)
    params.delete(FORFEIT_FILTER_PARAMS.person)

    pushParams(params)
  }

  const playedGameweeks = gameState?.currentEvent ?? 0
  const gameweekNumbers = Array.from({ length: playedGameweeks }, (_, index) => String(index + 1))
  const typeOptions = forfeitOptionsFor(cadence)
  const people = forfeitPeople(scope)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Select value={subType ?? type ?? ALL} onValueChange={selectForfeit}>
        <SelectTrigger className="w-full sm:w-52" aria-label="Forfeit type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card">
          <SelectItem value={ALL}>All forfeits</SelectItem>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        {cadence === "weekly" && (
          <Select
            value={gameweek ?? ALL}
            onValueChange={(value) =>
              setParam(FORFEIT_FILTER_PARAMS.gameweek, value === ALL ? null : value)
            }
          >
            <SelectTrigger className="min-w-0 flex-1 sm:w-32 sm:flex-none" aria-label="Game week">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value={ALL}>All weeks</SelectItem>
              {gameweekNumbers.map((week) => (
                <SelectItem key={week} value={week}>
                  Game Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={person ?? ALL}
          onValueChange={(value) =>
            setParam(FORFEIT_FILTER_PARAMS.person, value === ALL ? null : value)
          }
        >
          <SelectTrigger className="min-w-0 flex-1 sm:w-32 sm:flex-none" aria-label="Person">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value={ALL}>Everyone</SelectItem>
            {people.map((member) => (
              <SelectItem key={member.slug} value={member.slug}>
                {member.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
