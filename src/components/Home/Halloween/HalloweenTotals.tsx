import { HalloweenCauldron } from "@pbd/components/Home/Halloween/HalloweenCauldron"
import { HalloweenPumpkin } from "@pbd/components/Home/Halloween/HalloweenPumpkin"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { halloweenBodyFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const HalloweenTotals = ({ snapshot }: Props): JSX.Element => (
  <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
    {LEAGUE_SLUGS.map((slug, index) => (
      <div
        key={slug}
        className={cn(
          "flex min-w-0 items-center gap-2",
          index === 1 && "col-start-3 flex-row-reverse text-right",
        )}
      >
        <HalloweenPumpkin className="w-11 shrink-0" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-halloween-bone/80">
            {LEAGUE_LABELS[slug]}
          </span>
          <strong
            className={cn(
              halloweenBodyFont.className,
              "halloween-outline text-[30px] font-normal leading-none text-halloween-candle",
            )}
          >
            {fmtPts(snapshot[slug].total)}
          </strong>
        </div>
      </div>
    ))}
    <HalloweenCauldron className="col-start-2 row-start-1 w-14" />
  </div>
)
