"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { PICKS_DISPLAY_COUNT, POSITION_LABELS } from "@pbd/lib/constants/fpl";
import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/participants";
import type { FplElement } from "@pbd/types/fpl.types";
import { useTRPC } from "@pbd/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select";
import { PicksCard } from "../Cards/PicksCard";

type Props = {
  leagueId: number;
};

export const PicksGrid = ({ leagueId }: Props): JSX.Element => {
  const trpc = useTRPC();
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  const { data: choicesData } = useSuspenseQuery(
    trpc.fpl.draftChoices.queryOptions({ leagueId }),
  );
  const { data: bootstrap } = useSuspenseQuery(
    trpc.fpl.bootstrapStatic.queryOptions(),
  );

  const elementMap = useMemo(
    () => new Map<number, FplElement>(bootstrap.elements.map((e) => [e.id, e])),
    [bootstrap.elements],
  );

  const teamMap = useMemo(
    () => new Map(bootstrap.teams.map((t) => [t.id, t.short_name])),
    [bootstrap.teams],
  );

  const allPicks = useMemo(
    () =>
      choicesData.choices
        .slice()
        .sort((a, b) => a.round - b.round || a.pick - b.pick)
        .slice(0, PICKS_DISPLAY_COUNT),
    [choicesData.choices],
  );

  const participants = useMemo(() => {
    const seen = new Set<number>();
    return allPicks
      .map((c) => PARTICIPANT_BY_ENTRY_ID[c.entry])
      .filter(
        (p): p is NonNullable<typeof p> =>
          p !== undefined &&
          !seen.has(p.entryId) &&
          seen.add(p.entryId) !== undefined,
      );
  }, [allPicks]);

  const picks = useMemo(
    () =>
      selectedEntryId === null
        ? allPicks
        : allPicks.filter((c) => c.entry === selectedEntryId),
    [allPicks, selectedEntryId],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select
          value={selectedEntryId?.toString() ?? "all"}
          onValueChange={(val) =>
            setSelectedEntryId(val === "all" ? null : Number(val))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="all">All players</SelectItem>
            {participants.map((p) => (
              <SelectItem key={p.entryId} value={p.entryId.toString()}>
                {p.nickname ?? p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEntryId !== null && (
          <button
            type="button"
            onClick={() => setSelectedEntryId(null)}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {picks.map((choice) => {
          const overallPick = allPicks.indexOf(choice) + 1;
          const player = elementMap.get(choice.element);
          return (
            <PicksCard
              key={choice.id}
              overallPick={overallPick}
              playerName={player?.web_name ?? `#${choice.element}`}
              club={player ? (teamMap.get(player.team) ?? "") : ""}
              position={
                player ? (POSITION_LABELS[player.element_type] ?? "") : ""
              }
              managerName={
                PARTICIPANT_BY_ENTRY_ID[choice.entry]?.nickname ??
                PARTICIPANT_BY_ENTRY_ID[choice.entry]?.name ??
                choice.player_first_name
              }
              wasAuto={choice.was_auto}
              round={choice.round}
            />
          );
        })}
      </div>
    </div>
  );
};
