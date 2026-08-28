"use client"

import { ForfeitUploadButton } from "@pbd/components/Forfeits/ForfeitUploadButton"
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
import { forfeitPeople } from "@pbd/lib/forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

type Props = {
  scope: LeagueScope
  canUpload: boolean
}

const ALL = "all"

export const ForfeitsFilterBar = ({ scope, canUpload }: Props): JSX.Element => {
  const searchParams = useSearchParams()
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()
  const { data: gameState } = useGameState()

  const setParam = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)
    if (key === FORFEIT_FILTER_PARAMS.type) params.delete(FORFEIT_FILTER_PARAMS.subType)

    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  const resetFilters = (): void => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(FORFEIT_FILTER_PARAMS.gameweek)
    params.delete(FORFEIT_FILTER_PARAMS.type)
    params.delete(FORFEIT_FILTER_PARAMS.subType)
    params.delete(FORFEIT_FILTER_PARAMS.person)

    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  const playedGameweeks = gameState?.currentEvent ?? 0
  const gameweekNumbers = Array.from({ length: playedGameweeks }, (_, index) => String(index + 1))
  const typeOptions = FORFEIT_TYPES.filter((forfeitType) => forfeitType.category === cadence)
  const people = forfeitPeople(scope)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cadence === "weekly" && (
        <Select
          value={gameweek ?? ALL}
          onValueChange={(value) =>
            setParam(FORFEIT_FILTER_PARAMS.gameweek, value === ALL ? null : value)
          }
        >
          <SelectTrigger className="w-32" aria-label="Game week">
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
        value={type ?? ALL}
        onValueChange={(value) =>
          setParam(FORFEIT_FILTER_PARAMS.type, value === ALL ? null : value)
        }
      >
        <SelectTrigger className="w-48" aria-label="Forfeit type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card">
          <SelectItem value={ALL}>All forfeits</SelectItem>
          {typeOptions.map((forfeitType) => (
            <SelectItem key={forfeitType.slug} value={forfeitType.slug}>
              {forfeitType.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {type === "wildcard" && (
        <Select
          value={subType ?? ALL}
          onValueChange={(value) =>
            setParam(FORFEIT_FILTER_PARAMS.subType, value === ALL ? null : value)
          }
        >
          <SelectTrigger className="w-44" aria-label="Wildcard outcome">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value={ALL}>Any outcome</SelectItem>
            {WILDCARD_SUB_TYPES.map((outcome) => (
              <SelectItem key={outcome.slug} value={outcome.slug}>
                {outcome.label}
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
        <SelectTrigger className="w-32" aria-label="Person">
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

      <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasActiveFilters}>
        Reset
      </Button>

      <div className="ml-auto">
        <ForfeitUploadButton scope={scope} canUpload={canUpload} />
      </div>
    </div>
  )
}
