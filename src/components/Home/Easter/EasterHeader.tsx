import { EasterButterfly } from "@pbd/components/Home/Easter/EasterButterfly"
import { EasterCloud } from "@pbd/components/Home/Easter/EasterCloud"
import { EasterFlag } from "@pbd/components/Home/Easter/EasterFlag"
import { EasterSun } from "@pbd/components/Home/Easter/EasterSun"
import { HomeGarland } from "@pbd/components/Home/HomeGarland"
import { cn } from "@pbd/lib/className"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { HOME_NAME_PLACEHOLDER } from "@pbd/lib/constants/Home"
import { easterBodyFont, easterTitleFont } from "@pbd/lib/fonts"
import { allForfeitsFiled } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
  gameweek: string
}

const TITLE = "Bad Eggs"

const FLAGS = [
  { stop: 0.04, tone: "pink" },
  { stop: 0.12, tone: "mint" },
  { stop: 0.2, tone: "butter" },
  { stop: 0.28, tone: "lilac" },
  { stop: 0.36, tone: "pink" },
  { stop: 0.44, tone: "mint" },
  { stop: 0.52, tone: "butter" },
  { stop: 0.6, tone: "lilac" },
  { stop: 0.68, tone: "pink" },
] as const

const FORFEITS_HATCHING = "The forfeits are hatching..."

const FORFEITS_SERVED = "Forfeits served sunny side up!"

const TRAILING_CLOUD_DELAY = "2s"

const TRAILING_BUTTERFLY_DELAY = "1.3s"

export const EasterHeader = ({ snapshot, gameweek }: Props): JSX.Element => {
  const premiershipLoser = snapshot.premiership.loser?.name ?? HOME_NAME_PLACEHOLDER
  const championshipLoser = snapshot.championship.loser?.name ?? HOME_NAME_PLACEHOLDER
  const closing = allForfeitsFiled(snapshot.premiership.forfeit, snapshot.championship.forfeit)
    ? FORFEITS_SERVED
    : FORFEITS_HATCHING

  return (
    <header className="relative shrink-0 pt-11 text-center text-easter-ink">
      <EasterCloud className="absolute -left-2 top-[46%] w-20 opacity-90 motion-safe:animate-easter-breeze" />
      <span
        className="absolute right-[18%] top-[64%] w-14 opacity-80 motion-safe:animate-easter-breeze"
        style={{ animationDelay: TRAILING_CLOUD_DELAY }}
      >
        <EasterCloud className="block w-full" />
      </span>
      <EasterSun className="absolute -right-5 -top-6 w-28" />
      <HomeGarland
        className="absolute -inset-x-4 -top-2"
        items={FLAGS}
        stringClassName="stroke-easter-ink/40"
        renderItem={({ tone }) => <EasterFlag tone={tone} className="block w-5" />}
      />
      <span className="absolute left-[3%] top-[66%] motion-safe:animate-float">
        <EasterButterfly tone="pink" className="block w-7" />
      </span>
      <span
        className="absolute right-[4%] top-[86%] motion-safe:animate-float"
        style={{ animationDelay: TRAILING_BUTTERFLY_DELAY }}
      >
        <EasterButterfly tone="lilac" className="block w-6" />
      </span>

      <p className="relative text-[9px] font-black uppercase tracking-[0.3em] text-easter-lilac-deep">
        {APP_NAME} presents
      </p>
      <h1
        className={cn(
          easterTitleFont.className,
          "easter-title relative text-[58px] leading-[1] tracking-wide text-easter-pink",
        )}
      >
        {TITLE}
      </h1>
      <p className="relative mt-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-easter-grass-deep">
        Gameweek {gameweek} &middot; Season {CURRENT_SEASON}
      </p>
      <p
        className={cn(
          easterBodyFont.className,
          "relative mx-auto mt-2 max-w-[24rem] text-[13px] font-medium leading-snug",
        )}
      >
        {premiershipLoser} and {championshipLoser} are this week&rsquo;s bad eggs! {closing}
      </p>
    </header>
  )
}
