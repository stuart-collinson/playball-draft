import { cn } from "@pbd/lib/className"
import { LEAGUE_ABBREVIATIONS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { christmasBodyFont, christmasTitleFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const UNNAMED = "TBC"

export const ChristmasNiceList = ({ snapshot }: Props): JSX.Element => (
  <div className="flex shrink-0 flex-col gap-1.5">
    <h2
      className={cn(
        christmasTitleFont.className,
        "text-center text-xl font-bold leading-none text-christmas-pine",
      )}
    >
      The Nice List
    </h2>
    <div className="grid grid-cols-2 gap-3">
      {LEAGUE_SLUGS.map((slug) => (
        <p
          key={slug}
          className="flex min-w-0 items-center gap-2 rounded-full bg-christmas-pine px-3 py-1.5 text-christmas-snow"
        >
          <span aria-hidden className="christmas-present h-3.5 w-3.5 shrink-0" />
          <span className="shrink-0 text-[8px] font-black uppercase tracking-wider text-christmas-snow/75">
            {LEAGUE_ABBREVIATIONS[slug]}
          </span>
          <span className={cn(christmasBodyFont.className, "min-w-0 flex-1 truncate text-[13px]")}>
            {snapshot[slug].winner?.name ?? UNNAMED}
          </span>
          <b
            className={cn(
              christmasBodyFont.className,
              "shrink-0 text-[13px] font-normal text-christmas-gold",
            )}
          >
            {fmtPts(snapshot[slug].winner?.points)}
          </b>
        </p>
      ))}
    </div>
  </div>
)
