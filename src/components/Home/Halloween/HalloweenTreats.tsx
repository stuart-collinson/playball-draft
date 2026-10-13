import { cn } from "@pbd/lib/className"
import { LEAGUE_ABBREVIATIONS, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER } from "@pbd/lib/constants/Home"
import { halloweenBodyFont, halloweenTitleFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const HalloweenTreats = ({ snapshot }: Props): JSX.Element => (
  <div className="flex shrink-0 flex-col gap-1.5">
    <h2
      className={cn(
        halloweenTitleFont.className,
        "text-center text-base tracking-widest text-halloween-pumpkin",
      )}
    >
      Treats for the victors
    </h2>
    <div className="grid grid-cols-2 gap-3">
      {LEAGUE_SLUGS.map((slug) => (
        <p
          key={slug}
          className="flex min-w-0 items-center gap-2 rounded-full border border-halloween-pumpkin/40 bg-halloween-dusk/40 px-3 py-1.5"
        >
          <span aria-hidden className="halloween-candy-corn h-3.5 w-3 shrink-0" />
          <span className="shrink-0 text-[8px] font-black uppercase tracking-wider text-halloween-bone/70">
            {LEAGUE_ABBREVIATIONS[slug]}
          </span>
          <span className={cn(halloweenBodyFont.className, "min-w-0 flex-1 truncate text-[13px]")}>
            {snapshot[slug].winner?.name ?? HOME_NAME_PLACEHOLDER}
          </span>
          <b
            className={cn(
              halloweenBodyFont.className,
              "shrink-0 text-[13px] font-normal text-halloween-candle",
            )}
          >
            {fmtPts(snapshot[slug].winner?.points)}
          </b>
        </p>
      ))}
    </div>
  </div>
)
