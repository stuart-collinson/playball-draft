import { EasterBasket } from "@pbd/components/Home/Easter/EasterBasket"
import { EasterEgg } from "@pbd/components/Home/Easter/EasterEgg"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { easterBodyFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const EGG_TONES = { premiership: "pink", championship: "mint" } as const

export const EasterTotals = ({ snapshot }: Props): JSX.Element => (
  <div className="relative grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 text-easter-ink">
    {LEAGUE_SLUGS.map((slug, index) => (
      <div
        key={slug}
        className={cn(
          "flex min-w-0 items-center gap-2",
          index === 1 && "col-start-3 flex-row-reverse text-right",
        )}
      >
        <EasterEgg tone={EGG_TONES[slug]} className="w-9 shrink-0 -rotate-6" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-easter-ink/75">
            {LEAGUE_LABELS[slug]}
          </span>
          <strong
            className={cn(
              easterBodyFont.className,
              "text-[30px] font-bold leading-none text-easter-lilac-deep",
            )}
          >
            {fmtPts(snapshot[slug].total)}
          </strong>
        </div>
      </div>
    ))}
    <EasterBasket className="col-start-2 row-start-1 w-16" />
  </div>
)
