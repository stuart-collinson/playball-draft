"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { PICKS_DISPLAY_COUNT, POSITION_LABELS } from "@pbd/lib/constants/fpl";
import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/participants";
import type { FplElement } from "@pbd/types/fpl.types";
import { useTRPC } from "@pbd/trpc/react";

type PicksGridProps = {
  leagueId: number;
};

export const PicksGrid = ({ leagueId }: PicksGridProps): JSX.Element => {
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
        <select
          value={selectedEntryId ?? ""}
          onChange={(e) =>
            setSelectedEntryId(
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
          className="rounded-xl border border-border bg-card pl-3 px-8 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border"
        >
          <option value="">All players</option>
          {participants.map((p) => (
            <option key={p.entryId} value={p.entryId}>
              {p.nickname ?? p.name}
            </option>
          ))}
        </select>
        {selectedEntryId !== null && (
          <button
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
          const position = player
            ? (POSITION_LABELS[player.element_type] ?? "")
            : "";
          const club = player ? (teamMap.get(player.team) ?? "") : "";
          const managerFirst =
            PARTICIPANT_BY_ENTRY_ID[choice.entry]?.nickname ??
            PARTICIPANT_BY_ENTRY_ID[choice.entry]?.name ??
            choice.player_first_name;

          return (
            <div key={choice.id} className="relative pt-4">
              <div className="absolute left-1/2 top-0 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-border bg-card">
                <span className="text-[10px] font-black text-muted-foreground">
                  {overallPick}
                </span>
              </div>

              <div className="flex h-full flex-col rounded-xl border border-border bg-card px-2.5 pb-3 pt-6 text-center">
                <p className="text-sm font-bold leading-snug text-foreground">
                  {player?.web_name ?? `#${choice.element}`}
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {club}
                  {club && position ? " · " : ""}
                  {position}
                </p>

                <div className="my-2 h-px bg-border" />

                <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {managerFirst}
                  {choice.was_auto && (
                    <span className="ml-1 text-[9px] opacity-50">auto</span>
                  )}
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                  Rd {choice.round}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
