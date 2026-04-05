import type { JSX } from "react";

export const GameweekResultsSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    {[0, 1].map((i) => (
      <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
    ))}
  </div>
);
