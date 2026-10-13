import { ChristmasDrift } from "@pbd/components/Home/Christmas/ChristmasDrift"
import { ChristmasHeader } from "@pbd/components/Home/Christmas/ChristmasHeader"
import { ChristmasNiceList } from "@pbd/components/Home/Christmas/ChristmasNiceList"
import { ChristmasScroll } from "@pbd/components/Home/Christmas/ChristmasScroll"
import { ChristmasTotals } from "@pbd/components/Home/Christmas/ChristmasTotals"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { cn } from "@pbd/lib/className"
import { APP_NAME } from "@pbd/lib/constants/App"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { christmasTitleFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const ChristmasScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(HOME_SCREEN_CLASSES, "flex flex-col bg-christmas-snow text-christmas-snow")}
    >
      <div className="christmas-sky relative flex min-h-0 flex-1 flex-col gap-3 px-4 pt-2">
        <span
          aria-hidden
          className="christmas-snowfall pointer-events-none absolute inset-x-0 -top-[120px] bottom-0 motion-safe:animate-fall"
        />
        <ChristmasHeader snapshot={snapshot} gameweek={gameweek} />
        <ChristmasTotals snapshot={snapshot} />
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 pt-7">
          <ChristmasScroll league="premiership" snapshot={snapshot.premiership} side="left" />
          <ChristmasScroll league="championship" snapshot={snapshot.championship} side="right" />
        </div>
      </div>

      <div className="relative z-20 flex shrink-0 flex-col gap-3 px-4 pb-4 pt-1">
        <ChristmasDrift className="absolute inset-x-0 bottom-full h-6 w-full" />
        <ChristmasNiceList snapshot={snapshot} />
        <HomeShareButton
          target={shareTarget}
          title={`${APP_NAME} Naughty List — Gameweek ${gameweek}`}
          label="Share the cheer"
          className={cn(
            christmasTitleFont.className,
            "rounded-full bg-christmas-berry py-2 text-xl font-bold normal-case tracking-wide text-christmas-snow shadow-[0_4px_14px_var(--color-christmas-berry)]",
          )}
          iconClassName="h-4 w-4"
        />
      </div>
    </section>
  )
}
