import { cn } from "@pbd/lib/className"
import { LEAGUE_ABBREVIATIONS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { easterBodyFont, easterTitleFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const UNNAMED = "TBC"

export const EasterGoldenEggs = ({ snapshot }: Props): JSX.Element => (
  <div className="flex shrink-0 flex-col gap-1.5 text-easter-ink">
    <h2 className={cn(easterTitleFont.className, "text-center text-base leading-none")}>
      Golden eggs for the victors
    </h2>
    <div className="grid grid-cols-2 gap-3">
      {LEAGUE_SLUGS.map((slug) => (
        <p
          key={slug}
          className="flex min-w-0 items-center gap-2 rounded-full bg-easter-shell px-3 py-1.5 shadow-[0_3px_0_var(--color-easter-grass-deep)]"
        >
          <span aria-hidden className="easter-golden-egg h-4 w-3 shrink-0" />
          <span className="shrink-0 text-[8px] font-black uppercase tracking-wider text-easter-ink/70">
            {LEAGUE_ABBREVIATIONS[slug]}
          </span>
          <span
            className={cn(
              easterBodyFont.className,
              "min-w-0 flex-1 truncate text-[13px] font-semibold",
            )}
          >
            {snapshot[slug].winner?.name ?? UNNAMED}
          </span>
          <b
            className={cn(
              easterBodyFont.className,
              "shrink-0 text-[13px] font-bold text-easter-lilac-deep",
            )}
          >
            {fmtPts(snapshot[slug].winner?.points)}
          </b>
        </p>
      ))}
    </div>
  </div>
)
