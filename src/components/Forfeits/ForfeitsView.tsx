"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ForfeitCard } from "@pbd/components/Forfeits/ForfeitCard"
import { ForfeitUploadButton } from "@pbd/components/Forfeits/ForfeitUploadButton"
import { Button } from "@pbd/components/ui/Button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select"
import { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import { buildForfeitsListInput, forfeitPeople } from "@pbd/lib/forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"
import { useEffect, useRef } from "react"

type Props = {
  scope: LeagueScope
  canUpload: boolean
}

const ALL = "all"

const GAMEWEEK_PARAM = "gw"

const TYPE_PARAM = "type"

const SUB_TYPE_PARAM = "sub"

const PERSON_PARAM = "person"

const GAMEWEEK_NUMBERS = Array.from({ length: 38 }, (_, index) => String(index + 1))

export const ForfeitsView = ({ scope, canUpload }: Props): JSX.Element => {
  const searchParams = useSearchParams()
  const gameweek = searchParams.get(GAMEWEEK_PARAM)
  const type = searchParams.get(TYPE_PARAM)
  const subType = searchParams.get(SUB_TYPE_PARAM)
  const person = searchParams.get(PERSON_PARAM)
  const hasActiveFilters = Boolean(gameweek || type || subType || person)

  const query = useForfeitsList(buildForfeitsListInput(scope, { gameweek, type, subType, person }))
  const items = query.data.pages.flatMap((page) => page.items)

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasActiveFilters || !hasNextPage) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage) void fetchNextPage()
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasActiveFilters, hasNextPage, isFetchingNextPage, fetchNextPage])

  const setParam = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)
    if (key === TYPE_PARAM) params.delete(SUB_TYPE_PARAM)

    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  const resetFilters = (): void => window.history.pushState(null, "", window.location.pathname)

  const people = forfeitPeople(scope)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={gameweek ?? ALL}
          onValueChange={(value) => setParam(GAMEWEEK_PARAM, value === ALL ? null : value)}
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
          onValueChange={(value) => setParam(TYPE_PARAM, value === ALL ? null : value)}
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
            onValueChange={(value) => setParam(SUB_TYPE_PARAM, value === ALL ? null : value)}
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
          onValueChange={(value) => setParam(PERSON_PARAM, value === ALL ? null : value)}
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

      {items.length === 0 ? (
        <EmptyState
          title="No Forfeits"
          message={
            hasActiveFilters
              ? "Nothing matches those filters. Hit reset to see the latest."
              : "No forfeits have been uploaded yet. Someone's overdue a pint."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((forfeit) => (
              <ForfeitCard key={forfeit.id} scope={scope} forfeit={forfeit} />
            ))}
          </div>
          {hasActiveFilters && hasNextPage && <div ref={sentinelRef} className="h-10" />}
          {isFetchingNextPage && (
            <p className="text-center text-xs text-muted-foreground">Loading more…</p>
          )}
        </>
      )}
    </div>
  )
}
