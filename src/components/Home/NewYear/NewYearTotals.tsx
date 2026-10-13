import { NewYearClock } from "@pbd/components/Home/NewYear/NewYearClock"
import { NewYearGlass } from "@pbd/components/Home/NewYear/NewYearGlass"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { newYearBodyFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const GLASS_TILTS = { premiership: "rotate-12", championship: "-rotate-12" } as const

export const NewYearTotals = ({ snapshot }: Props): JSX.Element => (
  <div className="relative grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
    {LEAGUE_SLUGS.map((slug, index) => (
      <div
        key={slug}
        className={cn(
          "flex min-w-0 items-center gap-2",
          index === 1 && "col-start-3 flex-row-reverse text-right",
        )}
      >
        <NewYearGlass className={cn("w-6 shrink-0", GLASS_TILTS[slug])} />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-newyear-silver">
            {LEAGUE_LABELS[slug]}
          </span>
          <strong
            className={cn(
              newYearBodyFont.className,
              "text-[30px] font-bold leading-none text-newyear-gold",
            )}
          >
            {fmtPts(snapshot[slug].total)}
          </strong>
        </div>
      </div>
    ))}
    <NewYearClock className="col-start-2 row-start-1 w-14" />
  </div>
)
