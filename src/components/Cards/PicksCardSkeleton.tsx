import type { JSX } from "react";
import { Skeleton } from "@pbd/components/ui/skeleton";

export const PicksCardSkeleton = (): JSX.Element => (
  <div className="relative pt-4">
    <div className="absolute left-1/2 top-0 z-10 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-border bg-background" />
    <div className="flex flex-col items-center rounded-xl border border-border bg-card pt-6 pb-3 px-3 gap-2">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-4 w-16" />
      <div className="h-px w-full bg-border" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-2.5 w-8" />
    </div>
  </div>
);
