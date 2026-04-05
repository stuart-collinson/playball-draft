import type { JSX } from "react";

type Props = {
  overallPick: number;
  playerName: string;
  club: string;
  position: string;
  managerName: string;
  wasAuto: boolean;
  round: number;
};

export const PicksCard = ({
  overallPick,
  playerName,
  club,
  position,
  managerName,
  wasAuto,
  round,
}: Props): JSX.Element => (
  <div className="relative pt-4">
    <div className="absolute left-1/2 top-0 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-border bg-card">
      <span className="text-[10px] font-black text-muted-foreground">
        {overallPick}
      </span>
    </div>

    <div className="flex h-full flex-col rounded-xl border border-border bg-card px-2.5 pb-3 pt-6 text-center">
      <p className="text-sm font-bold leading-snug text-foreground">
        {playerName}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {club}
        {club && position ? " · " : ""}
        {position}
      </p>

      <div className="my-2 h-px bg-border" />

      <p className="text-[11px] font-medium leading-tight text-muted-foreground">
        {managerName}
        {wasAuto && (
          <span className="ml-1 text-[9px] opacity-50">auto</span>
        )}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground/60">
        Rd {round}
      </p>
    </div>
  </div>
);
