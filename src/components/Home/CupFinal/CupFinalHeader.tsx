import { cn } from "@pbd/lib/className"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { cupFinalBodyFont, cupFinalTitleFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { JSX } from "react"

type Props = {
  cupName: string | null
  gameweek: number | null
}

const FALLBACK_TITLE = "The Playball Cup"

export const CupFinalHeader = ({ cupName, gameweek }: Props): JSX.Element => (
  <header className="relative shrink-0 pt-4 text-center">
    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cupfinal-electric">
      {APP_NAME} presents
    </p>
    <h1
      className={cn(
        cupFinalTitleFont.className,
        "cupfinal-chrome mx-auto mt-1 line-clamp-2 max-w-[24rem] text-[28px] font-black uppercase leading-[1.05] tracking-tight",
      )}
    >
      {cupName ?? FALLBACK_TITLE}
    </h1>
    <p
      className={cn(
        cupFinalBodyFont.className,
        "mt-1 text-xs font-bold uppercase tracking-[0.3em] text-cupfinal-steel",
      )}
    >
      The Final
      {gameweek !== null && <> &middot; Gameweek {padGameweek(gameweek)}</>} &middot;{" "}
      {CURRENT_SEASON}
    </p>
  </header>
)
