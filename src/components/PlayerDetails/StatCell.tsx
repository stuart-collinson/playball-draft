import type { JSX } from "react";

type Props = {
  label: string;
  value: string;
  valueClassName?: string;
};

export const StatCell = ({
  label,
  value,
  valueClassName,
}: Props): JSX.Element => (
  <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 px-3 py-3">
    <span
      className={`text-base font-black tabular-nums text-foreground ${valueClassName ?? ""}`}
    >
      {value}
    </span>
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
      {label}
    </span>
  </div>
);
