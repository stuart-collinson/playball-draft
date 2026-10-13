import { NewYearGlass } from "@pbd/components/Home/NewYear/NewYearGlass"
import { cn } from "@pbd/lib/className"
import { LEAGUE_ABBREVIATIONS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER } from "@pbd/lib/constants/Home"
import { newYearBodyFont, newYearTitleFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const NewYearToasts = ({ snapshot }: Props): JSX.Element => (
  <div className="flex shrink-0 flex-col gap-1.5">
    <h2
      className={cn(
        newYearTitleFont.className,
        "text-center text-base leading-none tracking-wider text-newyear-gold",
      )}
    >
      Toasts to the victors
    </h2>
    <div className="grid grid-cols-2 gap-3">
      {LEAGUE_SLUGS.map((slug) => (
        <p
          key={slug}
          className="flex min-w-0 items-center gap-2 rounded-full border border-newyear-gold/50 bg-newyear-velvet px-3 py-1.5 text-newyear-fizz"
        >
          <NewYearGlass className="h-5 w-2.5 shrink-0" />
          <span className="shrink-0 text-[8px] font-black uppercase tracking-wider text-newyear-silver">
            {LEAGUE_ABBREVIATIONS[slug]}
          </span>
          <span
            className={cn(
              newYearBodyFont.className,
              "min-w-0 flex-1 truncate text-[13px] font-bold",
            )}
          >
            {snapshot[slug].winner?.name ?? HOME_NAME_PLACEHOLDER}
          </span>
          <b
            className={cn(
              newYearBodyFont.className,
              "shrink-0 text-[13px] font-bold text-newyear-gold",
            )}
          >
            {fmtPts(snapshot[slug].winner?.points)}
          </b>
        </p>
      ))}
    </div>
  </div>
)
