"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@pbd/components/ui/dialog";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import type { PlayerDialogData } from "@pbd/types/player.types";
import { Users } from "lucide-react";
import Image from "next/image";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import PlayerDetailsContent from "./Content";
import SquadView from "./SquadView";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: PlayerDialogData | null;
};

const PlayerDetails = ({ open, onOpenChange, player }: Props): JSX.Element => {
  const lastPlayerRef = useRef<PlayerDialogData | null>(player);
  if (player) lastPlayerRef.current = player;
  const p = lastPlayerRef.current;

  const [viewMode, setViewMode] = useState<"stats" | "squad">("stats");

  useEffect(() => {
    if (player) setViewMode("stats");
  }, [player]);

  const participant = p ? PARTICIPANT_BY_API_ID[p.apiId] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {p && (
        <DialogContent
          className="max-w-sm border-border bg-card"
          overlayClassName="bg-black/80"
        >
          <button
            type="button"
            aria-label="Toggle squad view"
            onClick={() =>
              setViewMode((v) => (v === "stats" ? "squad" : "stats"))
            }
            className={`absolute top-4 left-4 rounded-sm transition-opacity focus:outline-none ${
              viewMode === "squad"
                ? "opacity-100 text-green-400"
                : "opacity-50 hover:opacity-100 text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center gap-4 pt-2 pb-2">
            <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-border">
              {participant?.image ? (
                <Image
                  src={participant.image}
                  alt={p.playerName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {p.playerName[0]}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <DialogTitle className="text-xl">{p.playerName}</DialogTitle>
              <DialogDescription>{p.teamName}</DialogDescription>
              <span className="mt-2 inline-block rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                {p.leagueName}
              </span>
            </div>
          </div>

          {viewMode === "stats" ? (
            <PlayerDetailsContent player={p} />
          ) : (
            <SquadView player={p} />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default PlayerDetails;
