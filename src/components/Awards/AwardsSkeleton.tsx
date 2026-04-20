import type { JSX } from "react";
import { Skeleton } from "@pbd/components/ui/skeleton";

const AWARD_COUNT = 12;

export const AwardsSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {Array.from({ length: AWARD_COUNT }).map((_, i) => (
      <div
        key={i}
        className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-16" />
          <div className="h-px flex-1 bg-accent" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    ))}
  </div>
);
