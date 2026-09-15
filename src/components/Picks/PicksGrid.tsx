"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { PicksCard } from "@pbd/components/Picks/PicksCard"
import { Button } from "@pbd/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select"
import { useBootstrapStatic } from "@pbd/hooks/fpl/useBootstrapStatic"
import { useDraftChoices } from "@pbd/hooks/fpl/useDraftChoices"
import { PICKS_DISPLAY_COUNT, POSITION_LABELS } from "@pbd/lib/constants/Fpl"
import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/Participants"
import { managerNameForEntryId } from "@pbd/lib/people"
import type { FplElement } from "@pbd/types/fpl.types"
import { X } from "lucide-react"
import type { JSX } from "react"
import { useMemo, useState } from "react"

type Props = {
  leagueId: number
}

export const PicksGrid = ({ leagueId }: Props): JSX.Element => {
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)

  const { data: choicesData } = useDraftChoices(leagueId)
  const { data: bootstrap } = useBootstrapStatic()

  const elementMap = useMemo(
    () => new Map<number, FplElement>(bootstrap.elements.map((e) => [e.id, e])),
    [bootstrap.elements],
  )

  const teamMap = useMemo(
    () => new Map(bootstrap.teams.map((t) => [t.id, t.short_name])),
    [bootstrap.teams],
  )

  const allPicks = useMemo(
    () =>
      (choicesData?.choices ?? [])
        .slice()
        .sort((a, b) => a.round - b.round || a.pick - b.pick)
        .slice(0, PICKS_DISPLAY_COUNT),
    [choicesData],
  )

  const participants = useMemo(() => {
    const seen = new Set<number>()
    return allPicks
      .map((c) => PARTICIPANT_BY_ENTRY_ID[c.entry])
      .filter(
        (p): p is NonNullable<typeof p> =>
          p !== undefined && !seen.has(p.entryId) && seen.add(p.entryId) !== undefined,
      )
  }, [allPicks])

  const picks = useMemo(
    () =>
      selectedEntryId === null ? allPicks : allPicks.filter((c) => c.entry === selectedEntryId),
    [allPicks, selectedEntryId],
  )

  if (allPicks.length === 0)
    return (
      <EmptyState title="No Draft Picks Yet" message="Picks appear once your league has drafted." />
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select
          value={selectedEntryId?.toString() ?? "all"}
          onValueChange={(val) => setSelectedEntryId(val === "all" ? null : Number(val))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All players</SelectItem>
            {participants.map((p) => (
              <SelectItem key={p.entryId} value={p.entryId.toString()}>
                {p.nickname ?? p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEntryId !== null && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Show all players"
            onClick={() => setSelectedEntryId(null)}
            className="rounded-full text-muted-foreground"
          >
            <X />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {picks.map((choice) => {
          const overallPick = allPicks.indexOf(choice) + 1
          const player = elementMap.get(choice.element)
          return (
            <PicksCard
              key={choice.id}
              overallPick={overallPick}
              playerName={player?.web_name ?? `#${choice.element}`}
              club={player ? (teamMap.get(player.team) ?? "") : ""}
              position={player ? (POSITION_LABELS[player.element_type] ?? "") : ""}
              managerName={managerNameForEntryId(choice.entry, choice.player_first_name)}
              wasAuto={choice.was_auto}
              round={choice.round}
            />
          )
        })}
      </div>
    </div>
  )
}
