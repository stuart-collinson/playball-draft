import { HalloweenGrave } from "@pbd/components/Home/HalloweenGrave"
import { HalloweenHeader } from "@pbd/components/Home/HalloweenHeader"
import { HalloweenHill } from "@pbd/components/Home/HalloweenHill"
import { HalloweenTotals } from "@pbd/components/Home/HalloweenTotals"
import { HalloweenTreats } from "@pbd/components/Home/HalloweenTreats"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { cn } from "@pbd/lib/className"
import { APP_NAME } from "@pbd/lib/constants/App"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { halloweenTitleFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const HalloweenScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(HOME_SCREEN_CLASSES, "flex flex-col bg-halloween-night text-halloween-bone")}
    >
      <div className="halloween-sky relative flex min-h-0 flex-1 flex-col gap-3 px-4 pt-2">
        <HalloweenHeader snapshot={snapshot} gameweek={gameweek} />
        <HalloweenTotals snapshot={snapshot} />
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 pt-5">
          <HalloweenGrave league="premiership" snapshot={snapshot.premiership} side="left" />
          <HalloweenGrave league="championship" snapshot={snapshot.championship} side="right" />
        </div>
      </div>

      <div className="relative z-20 flex shrink-0 flex-col gap-3 px-4 pb-4 pt-1">
        <HalloweenHill className="absolute inset-x-0 bottom-full h-6 w-full" />
        <HalloweenTreats snapshot={snapshot} />
        <HomeShareButton
          target={shareTarget}
          title={`${APP_NAME} Fright Night — Gameweek ${gameweek}`}
          label="Share the scare"
          className={cn(
            halloweenTitleFont.className,
            "rounded-full bg-halloween-pumpkin py-2.5 text-lg font-normal tracking-widest text-halloween-night shadow-[0_0_18px_var(--color-halloween-pumpkin)]",
          )}
          iconClassName="h-4 w-4"
        />
      </div>
    </section>
  )
}
