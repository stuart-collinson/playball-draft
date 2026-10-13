import { ChristmasBauble } from "@pbd/components/Home/Christmas/ChristmasBauble"
import { ChristmasPudding } from "@pbd/components/Home/Christmas/ChristmasPudding"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { christmasBodyFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const BAUBLE_TONES = { premiership: "berry", championship: "pine" } as const

export const ChristmasTotals = ({ snapshot }: Props): JSX.Element => (
  <div className="relative grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
    {LEAGUE_SLUGS.map((slug, index) => (
      <div
        key={slug}
        className={cn(
          "flex min-w-0 items-center gap-2",
          index === 1 && "col-start-3 flex-row-reverse text-right",
        )}
      >
        <ChristmasBauble tone={BAUBLE_TONES[slug]} className="w-10 shrink-0" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-christmas-frost">
            {LEAGUE_LABELS[slug]}
          </span>
          <strong
            className={cn(
              christmasBodyFont.className,
              "christmas-glow text-[30px] font-normal leading-none text-christmas-gold",
            )}
          >
            {fmtPts(snapshot[slug].total)}
          </strong>
        </div>
      </div>
    ))}
    <ChristmasPudding className="col-start-2 row-start-1 w-16" />
  </div>
)
