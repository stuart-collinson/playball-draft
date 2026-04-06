import type { JSX } from "react";

type Props = {
  label: string;
  labelColor: string;
  ruleColor: string;
  managerName: string;
  teamName: string;
  value: string;
  sub?: string;
};

export const AwardCard = ({
  label,
  labelColor,
  ruleColor,
  managerName,
  teamName,
  value,
  sub,
}: Props): JSX.Element => {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={`shrink-0 text-[9px] font-black uppercase tracking-[0.25em] ${labelColor}`}
        >
          {label}
        </span>
        <div className={`h-px flex-1 ${ruleColor}`} />
      </div>
      <div>
        <p className="text-sm font-bold leading-tight text-foreground">
          {managerName}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{teamName}</p>
      </div>
      <div>
        <p className={`text-xl font-black tabular-nums ${labelColor}`}>
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
        )}
      </div>
    </div>
  );
};
