import type { JSX } from "react";
import { PicksCardSkeleton } from "../Cards/PicksCardSkeleton";

const SKELETON_KEYS = ["a","b","c","d","e","f","g","h","i","j","k","l"] as const;

export const PicksGridSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
    {SKELETON_KEYS.map((key) => (
      <PicksCardSkeleton key={key} />
    ))}
  </div>
);
