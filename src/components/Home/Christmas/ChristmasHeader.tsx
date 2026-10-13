import { ChristmasBulb } from "@pbd/components/Home/Christmas/ChristmasBulb"
import { ChristmasHolly } from "@pbd/components/Home/Christmas/ChristmasHolly"
import { ChristmasMoon } from "@pbd/components/Home/Christmas/ChristmasMoon"
import { ChristmasSnowflake } from "@pbd/components/Home/Christmas/ChristmasSnowflake"
import { HomeGarland } from "@pbd/components/Home/HomeGarland"
import { cn } from "@pbd/lib/className"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { christmasBodyFont, christmasTitleFont } from "@pbd/lib/fonts"
import { allForfeitsFiled } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
  gameweek: string
}

const UNNAMED = "TBC"

const TITLE = "Naughty List"

const BULBS = [
  { stop: 0.05, tone: "berry" },
  { stop: 0.15, tone: "gold" },
  { stop: 0.25, tone: "pine" },
  { stop: 0.35, tone: "frost" },
  { stop: 0.45, tone: "berry" },
  { stop: 0.55, tone: "gold" },
  { stop: 0.65, tone: "pine" },
] as const

const BULB_BLINK_STAGGER_SECONDS = 0.35

const COAL_INCOMING = "Coal is on its way..."

const SANTA_PAID_OFF = "Santa has been paid off!"

const SNOWFLAKES = [
  { position: "left-[2%] top-[48%] w-4", delay: "0s" },
  { position: "left-[9%] top-[68%] w-3", delay: "0.9s" },
  { position: "right-[3%] top-[70%] w-4", delay: "0.4s" },
  { position: "right-[10%] top-[52%] w-3", delay: "1.5s" },
  { position: "left-[2%] top-[88%] w-3", delay: "2s" },
]

export const ChristmasHeader = ({ snapshot, gameweek }: Props): JSX.Element => {
  const premiershipLoser = snapshot.premiership.loser?.name ?? UNNAMED
  const championshipLoser = snapshot.championship.loser?.name ?? UNNAMED
  const closing = allForfeitsFiled(snapshot.premiership.forfeit, snapshot.championship.forfeit)
    ? SANTA_PAID_OFF
    : COAL_INCOMING

  return (
    <header className="relative shrink-0 pt-11 text-center">
      <ChristmasHolly className="absolute -left-3 -top-1 w-16" />
      <ChristmasMoon className="absolute -right-2 -top-1" />
      <HomeGarland
        className="absolute -inset-x-4 -top-2"
        items={BULBS}
        stringClassName="stroke-christmas-pine"
        renderItem={({ tone }, index) => (
          <span
            className="block motion-safe:animate-christmas-blink"
            style={{ animationDelay: `${index * BULB_BLINK_STAGGER_SECONDS}s` }}
          >
            <ChristmasBulb tone={tone} className="block w-3.5" />
          </span>
        )}
      />
      {SNOWFLAKES.map(({ position, delay }) => (
        <span
          key={position}
          aria-hidden
          className={cn("absolute motion-safe:animate-twinkle", position)}
          style={{ animationDelay: delay }}
        >
          <ChristmasSnowflake className="block w-full" />
        </span>
      ))}

      <p className="relative text-[9px] font-black uppercase tracking-[0.3em] text-christmas-gold">
        {APP_NAME} presents
      </p>
      <h1
        className={cn(
          christmasTitleFont.className,
          "christmas-outline christmas-glow relative text-[56px] font-bold leading-[1] text-christmas-snow",
        )}
      >
        {TITLE}
      </h1>
      <p className="relative mt-3 text-[9px] font-black uppercase tracking-[0.25em] text-christmas-frost">
        Gameweek {gameweek} &middot; Season {CURRENT_SEASON}
      </p>
      <p
        className={cn(
          christmasBodyFont.className,
          "relative mx-auto mt-2 max-w-[24rem] text-[13px] leading-snug text-christmas-snow",
        )}
      >
        {premiershipLoser} and {championshipLoser} have been caught being naughty! {closing}
      </p>
    </header>
  )
}
