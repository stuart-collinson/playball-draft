"use client";

import Image from "next/image";
import type { JSX } from "react";
import { useRef } from "react";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@pbd/components/ui/dialog";
import { StatCell } from "./StatCell";

export type PlayerDialogData = {
  apiId: number;
  playerName: string;
  teamName: string;
  leagueName: string;
  leaguePosition: number;
  overallPosition: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: PlayerDialogData | null;
};

const PlayerDetails = ({ open, onOpenChange, player }: Props): JSX.Element => {
  const lastPlayerRef = useRef<PlayerDialogData | null>(player);
  if (player) lastPlayerRef.current = player;
  const p = lastPlayerRef.current;

  const participant = p ? PARTICIPANT_BY_API_ID[p.apiId] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {p && (
        <DialogContent
          className="max-w-sm border-border bg-card"
          overlayClassName="bg-black/80"
        >
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

          <div className="grid grid-cols-2 gap-2">
            <StatCell label="League Pos" value={`#${p.leaguePosition}`} />
            <StatCell label="Overall" value={`#${p.overallPosition}`} />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default PlayerDetails;
