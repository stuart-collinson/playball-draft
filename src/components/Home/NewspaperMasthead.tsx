import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import { newspaperMastheadFont } from "@pbd/lib/fonts"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  gameweek: string
}

const MASTHEAD = "The Daily Playball"

const SLOGAN = "This is absolute cinema!"

const COVER_PRICE = "Price: One Forfeit"

const RIBBON_CLASSES = "text-[8px] uppercase tracking-[0.18em] text-newsprint-muted"

export const NewspaperMasthead = ({ gameweek }: Props): JSX.Element => (
  <header className="shrink-0 border-b-4 border-double border-newsprint-ink pb-1.5">
    <div
      className={cn(
        "flex items-center justify-between border-b border-newsprint-ink/40 pb-1",
        RIBBON_CLASSES,
      )}
    >
      <span>Viva La Draft</span>
      <span>Gameweek No. {gameweek}</span>
    </div>

    <h1
      className={cn(
        newspaperMastheadFont.className,
        "py-1 text-center text-[44px] leading-[1.08] tracking-tight text-newsprint-ink",
      )}
    >
      {MASTHEAD}
    </h1>

    <div
      className={cn(
        "flex items-center justify-between gap-2 border-t border-newsprint-ink/40 pt-1",
        RIBBON_CLASSES,
      )}
    >
      <span className="border border-newsprint-muted px-1.5 py-px text-[7.5px] italic normal-case tracking-normal">
        &ldquo;{SLOGAN}&rdquo;
      </span>
      <span className="whitespace-nowrap">Season {CURRENT_SEASON}</span>
      <span className="whitespace-nowrap">{COVER_PRICE}</span>
    </div>
  </header>
)
