import { HalloweenGarland } from "@pbd/components/Home/Halloween/HalloweenGarland"
import { HalloweenMoon } from "@pbd/components/Home/Halloween/HalloweenMoon"
import { HalloweenWeb } from "@pbd/components/Home/Halloween/HalloweenWeb"
import { cn } from "@pbd/lib/className"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { halloweenBodyFont, halloweenTitleFont } from "@pbd/lib/fonts"
import { allForfeitsFiled } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
  gameweek: string
}

const UNNAMED = "TBC"

const TITLE = "Fright Night"

const CURSE_LINGERS = "The forfeits now haunt them..."

const CURSE_LIFTED = "The curse has been lifted!"

const SPARKLES = [
  { position: "left-[2%] top-[46%]", delay: "0s" },
  { position: "left-[9%] top-[64%]", delay: "0.9s" },
  { position: "right-[3%] top-[66%]", delay: "0.4s" },
  { position: "right-[9%] top-[50%]", delay: "1.5s" },
  { position: "left-[2%] top-[86%]", delay: "2s" },
]

export const HalloweenHeader = ({ snapshot, gameweek }: Props): JSX.Element => {
  const premiershipLoser = snapshot.premiership.loser?.name ?? UNNAMED
  const championshipLoser = snapshot.championship.loser?.name ?? UNNAMED
  const closing = allForfeitsFiled(snapshot.premiership.forfeit, snapshot.championship.forfeit)
    ? CURSE_LIFTED
    : CURSE_LINGERS

  return (
    <header className="relative shrink-0 pt-11 text-center">
      <HalloweenWeb className="absolute -left-4 -top-2 h-20 w-20" />
      <HalloweenMoon className="absolute -right-3 -top-1" />
      <HalloweenGarland className="absolute -inset-x-4 -top-2" />
      {SPARKLES.map(({ position, delay }) => (
        <span
          key={position}
          aria-hidden
          className={cn(
            "absolute text-sm text-halloween-slime motion-safe:animate-halloween-twinkle",
            position,
          )}
          style={{ animationDelay: delay }}
        >
          &#10022;
        </span>
      ))}

      <p className="relative text-[9px] font-black uppercase tracking-[0.3em] text-halloween-candle">
        {APP_NAME} presents
      </p>
      <h1
        className={cn(
          halloweenTitleFont.className,
          "halloween-outline halloween-glow relative text-[56px] uppercase leading-[0.95] tracking-wide text-halloween-pumpkin",
        )}
      >
        {TITLE}
      </h1>
      <p className="relative text-[9px] font-black uppercase tracking-[0.25em] text-halloween-slime">
        Gameweek {gameweek} &middot; Season {CURRENT_SEASON}
      </p>
      <p
        className={cn(
          halloweenBodyFont.className,
          "relative mx-auto mt-2 max-w-[24rem] text-[13px] leading-snug",
        )}
      >
        {premiershipLoser} and {championshipLoser} have been cursed! {closing}
      </p>
    </header>
  )
}
