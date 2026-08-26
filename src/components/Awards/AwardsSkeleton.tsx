import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { AWARD_DEFINITIONS } from "@pbd/lib/constants/Awards"
import type { JSX } from "react"

export const AwardsSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {AWARD_DEFINITIONS.map((award) => (
      <div
        key={award.key}
        className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span
            className={`shrink-0 text-[9px] font-black uppercase tracking-[0.25em] ${award.labelColor}`}
          >
            {award.label}
          </span>
          <div className={`h-px flex-1 ${award.ruleColor}`} />
        </div>

        <div>
          <p className="text-sm font-bold leading-tight">
            <SkeletonText className="w-20" />
          </p>
          <p className="mt-0.5 text-[10px]">
            <SkeletonText className="w-16" />
          </p>
        </div>

        <div>
          <p className="text-xl font-black">
            <SkeletonText className="w-12" />
          </p>
          {award.hasDetail && (
            <p className="mt-0.5 text-[10px]">
              <SkeletonText className="w-16" />
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)
