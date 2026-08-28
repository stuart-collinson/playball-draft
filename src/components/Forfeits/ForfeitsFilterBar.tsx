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

const GAMEWEEK_NUMBERS = Array.from({ length: 38 }, (_, index) => String(index + 1))

export const ForfeitsFilterBar = ({ scope, canUpload }: Props): JSX.Element => {
  const searchParams = useSearchParams()
  const { gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()

  const setParam = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)
    if (key === FORFEIT_FILTER_PARAMS.type) params.delete(FORFEIT_FILTER_PARAMS.subType)

    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  const resetFilters = (): void => window.history.pushState(null, "", window.location.pathname)

  const people = forfeitPeople(scope)

  return (
    <div className="flex flex-wrap items-center gap-2">
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
          <SelectItem value="annual">Annual</SelectItem>
          {GAMEWEEK_NUMBERS.map((week) => (
            <SelectItem key={week} value={week}>
              Game Week {week}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={type ?? ALL}
        onValueChange={(value) =>
          setParam(FORFEIT_FILTER_PARAMS.type, value === ALL ? null : value)
        }
      >
        <SelectTrigger className="w-36" aria-label="Forfeit type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card">
          <SelectItem value={ALL}>All forfeits</SelectItem>
          {FORFEIT_TYPES.map((forfeitType) => (
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
          <SelectTrigger className="w-40" aria-label="Wildcard outcome">
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
