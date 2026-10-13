import { HomeGarland } from "@pbd/components/Home/HomeGarland"
import { NewYearFirework } from "@pbd/components/Home/NewYear/NewYearFirework"
import { NewYearStar } from "@pbd/components/Home/NewYear/NewYearStar"
import { cn } from "@pbd/lib/className"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { HOME_NAME_PLACEHOLDER } from "@pbd/lib/constants/Home"
import { newYearBodyFont, newYearTitleFont } from "@pbd/lib/fonts"
import { allForfeitsFiled } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
  gameweek: string
}

const STARS = [
  { stop: 0.06, tone: "gold" },
  { stop: 0.18, tone: "silver" },
  { stop: 0.3, tone: "gold" },
  { stop: 0.42, tone: "silver" },
  { stop: 0.54, tone: "gold" },
  { stop: 0.66, tone: "silver" },
  { stop: 0.78, tone: "gold" },
  { stop: 0.9, tone: "silver" },
] as const

const FIREWORKS = [
  { tone: "magenta", position: "-right-4 top-6 w-28", delay: "0s" },
  { tone: "gold", position: "-left-6 top-[38%] w-24", delay: "1.1s" },
  { tone: "cyan", position: "right-[3%] top-[48%] w-12", delay: "1.9s" },
] as const

const RESOLUTIONS_DUE = "Resolutions are due..."

const RESOLUTIONS_KEPT = "Resolutions kept, forfeits done!"

export const NewYearHeader = ({ snapshot, gameweek }: Props): JSX.Element => {
  const premiershipLoser = snapshot.premiership.loser?.name ?? HOME_NAME_PLACEHOLDER
  const championshipLoser = snapshot.championship.loser?.name ?? HOME_NAME_PLACEHOLDER
  const closing = allForfeitsFiled(snapshot.premiership.forfeit, snapshot.championship.forfeit)
    ? RESOLUTIONS_KEPT
    : RESOLUTIONS_DUE

  return (
    <header className="relative shrink-0 pt-11 text-center">
      {FIREWORKS.map(({ tone, position, delay }) => (
        <span
          key={tone}
          aria-hidden
          className={cn("absolute motion-safe:animate-newyear-burst", position)}
          style={{ animationDelay: delay }}
        >
          <NewYearFirework tone={tone} className="block w-full" />
        </span>
      ))}
      <HomeGarland
        className="absolute -inset-x-4 -top-2"
        items={STARS}
        stringClassName="stroke-newyear-silver/40"
        renderItem={({ tone }) => <NewYearStar tone={tone} className="block w-5" />}
      />

      <p className="relative text-[9px] font-black uppercase tracking-[0.3em] text-newyear-silver">
        {APP_NAME} presents
      </p>
      <h1
        className={cn(
          newYearTitleFont.className,
          "newyear-gilt relative text-[38px] uppercase leading-[1.05] tracking-wide",
        )}
      >
        New Year,
        <br />
        Same Losers
      </h1>
      <p className="relative mt-1 text-[9px] font-black uppercase tracking-[0.25em] text-newyear-cyan">
        Gameweek {gameweek} &middot; Season {CURRENT_SEASON}
      </p>
      <p
        className={cn(
          newYearBodyFont.className,
          "relative mx-auto mt-2 max-w-[24rem] text-[13px] font-semibold leading-snug text-newyear-fizz",
        )}
      >
        {premiershipLoser} and {championshipLoser} start the year as losers! {closing}
      </p>
    </header>
  )
}
