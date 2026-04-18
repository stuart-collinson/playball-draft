"use client";

import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo } from "react";
import { useTRPC } from "@pbd/trpc/react";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import type { PlayerDialogData } from "@pbd/types/player.types";

type Props = {
  player: PlayerDialogData;
};

const POSITION_ROW_ORDER = [1, 2, 3, 4] as const;

const SquadView = ({ player }: Props): JSX.Element => {
  const trpc = useTRPC();
  const entryId = PARTICIPANT_BY_API_ID[player.apiId]?.entryId ?? 0;

  const { data: bootstrap } = useQuery(trpc.fpl.bootstrapStatic.queryOptions());
  const currentEvent = bootstrap?.events.current ?? 0;

  const { data: picksData, isLoading: picksLoading } = useQuery({
    ...trpc.fpl.entryEventPicks.queryOptions({ entryId, eventId: currentEvent }),
    enabled: entryId > 0 && currentEvent > 0,
  });

  const { data: liveData } = useQuery({
    ...trpc.fpl.eventLive.queryOptions({ eventId: currentEvent }),
    enabled: currentEvent > 0,
  });

  const elementMap = useMemo(
    () =>
      bootstrap
        ? new Map(bootstrap.elements.map((e) => [e.id, e]))
        : new Map(),
    [bootstrap],
  );

  const starters = useMemo(
    () =>
      (picksData?.picks ?? [])
        .filter((p) => p.position <= 11)
        .sort((a, b) => a.position - b.position),
    [picksData],
  );

  const bench = useMemo(
    () =>
      (picksData?.picks ?? [])
        .filter((p) => p.position > 11)
        .sort((a, b) => a.position - b.position),
    [picksData],
  );

  const startersByPosition = useMemo(() => {
    const grouped = new Map<number, typeof starters>([
      [1, []],
      [2, []],
      [3, []],
      [4, []],
    ]);
    for (const pick of starters) {
      const el = elementMap.get(pick.element);
      if (!el) continue;
      grouped.get(el.element_type)?.push(pick);
    }
    return grouped;
  }, [starters, elementMap]);

  const getPoints = (elementId: number): number =>
    liveData?.elements[String(elementId)]?.stats.total_points ?? 0;

  if (!picksData || !bootstrap || picksLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading squad...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl">
      {/* Pitch */}
      <div
        className="relative flex flex-col gap-4 px-2 py-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #2d8a2d 0px, #2d8a2d 32px, #267326 32px, #267326 64px)",
        }}
      >
        {/* Center line */}
        <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-white/20" />
        {/* Center circle */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

        {POSITION_ROW_ORDER.map((posType) => {
          const players = startersByPosition.get(posType) ?? [];
          if (!players.length) return null;
          return (
            <div key={posType} className="relative z-10 flex justify-evenly">
              {players.map((pick) => {
                const el = elementMap.get(pick.element);
                const pts = getPoints(pick.element);
                return (
                  <div
                    key={pick.element}
                    className="flex w-14 flex-col items-center"
                  >
                    <div className="w-full rounded bg-black/50 px-1 py-0.5 text-center">
                      <p className="truncate text-xs font-bold leading-tight text-white">
                        {el?.web_name ?? "?"}
                      </p>
                      <p className="text-[10px] text-white/80">{pts}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bench */}
      <div className="flex justify-evenly bg-green-900 px-2 py-3">
        {(() => {
          let outfieldCount = 0;
          return bench.map((pick) => {
            const el = elementMap.get(pick.element);
            const pts = getPoints(pick.element);
            const isGk = el?.element_type === 1;
            const label = isGk ? "GK" : String(++outfieldCount);
            return (
              <div key={pick.element} className="flex w-14 flex-col items-center gap-0.5">
                <div className="w-full rounded bg-black/30 px-1 py-0.5 text-center">
                  <p className="truncate text-xs font-bold leading-tight text-white/80">
                    {el?.web_name ?? "?"}
                  </p>
                  <p className="text-[10px] text-white/60">{pts}</p>
                </div>
                <p className="text-[9px] text-white/40">{label}</p>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default SquadView;
