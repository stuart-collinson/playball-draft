import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { NewspaperColumn } from "@pbd/components/Home/NewspaperColumn"
import { NewspaperFooter } from "@pbd/components/Home/NewspaperFooter"
import { NewspaperMasthead } from "@pbd/components/Home/NewspaperMasthead"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { newspaperBodyFont, newspaperHeadlineFont } from "@pbd/lib/fonts"
import { allForfeitsFiled, padGameweek } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const UNNAMED = "TBC"

const HEADLINE = "Two Men Disgraced"

const BYLINE = "For the love of fantasy football!"

const FORFEITS_AWAITED = "The forfeits now await..."

const FORFEITS_LANDED = "The forfeits have landed!"

export const NewspaperScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)
  const premiershipLoser = snapshot.premiership.loser?.name ?? UNNAMED
  const championshipLoser = snapshot.championship.loser?.name ?? UNNAMED
  const closing = allForfeitsFiled(snapshot.premiership.forfeit, snapshot.championship.forfeit)
    ? FORFEITS_LANDED
    : FORFEITS_AWAITED

  return (
    <section
      ref={shareTarget}
      className={cn(
        HOME_SCREEN_CLASSES,
        newspaperBodyFont.className,
        "newsprint-grain flex flex-col gap-2 bg-newsprint-page px-4 pb-3.5 pt-3 text-newsprint-ink",
      )}
    >
      <NewspaperMasthead gameweek={gameweek} />

      <div className="shrink-0 text-center">
        <h2
          className={cn(
            newspaperHeadlineFont.className,
            "text-[38px] font-bold uppercase leading-[0.92] tracking-[-0.02em]",
          )}
        >
          {HEADLINE}
        </h2>
        <span aria-hidden className="mx-auto my-1.5 block h-px w-24 bg-newsprint-ink" />
        <p className="text-[12.5px] italic leading-tight">
          {premiershipLoser} and {championshipLoser} suffer agonising defeat as Gameweek {gameweek}{" "}
          draws to a close. {closing}
        </p>
        <p className="mt-1.5 border-y border-newsprint-ink/40 py-0.5 text-[8px] uppercase tracking-[0.18em] text-newsprint-muted">
          {BYLINE}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-newsprint-ink/40">
        <NewspaperColumn league="premiership" snapshot={snapshot.premiership} />
        <NewspaperColumn league="championship" snapshot={snapshot.championship} />
      </div>

      <NewspaperFooter snapshot={snapshot} />

      <HomeShareButton
        target={shareTarget}
        title={`The Daily Playball — Gameweek ${gameweek}`}
        label="Share the front page"
        className="shrink-0 border-2 border-newsprint-ink bg-newsprint-ink py-2.5 text-[10px] tracking-[0.16em] text-newsprint-page"
        iconClassName="h-3.5 w-3.5"
      />
    </section>
  )
}
