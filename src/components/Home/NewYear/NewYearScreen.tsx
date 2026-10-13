import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { NewYearHeader } from "@pbd/components/Home/NewYear/NewYearHeader"
import { NewYearResolution } from "@pbd/components/Home/NewYear/NewYearResolution"
import { NewYearSkyline } from "@pbd/components/Home/NewYear/NewYearSkyline"
import { NewYearToasts } from "@pbd/components/Home/NewYear/NewYearToasts"
import { NewYearTotals } from "@pbd/components/Home/NewYear/NewYearTotals"
import { cn } from "@pbd/lib/className"
import { APP_NAME } from "@pbd/lib/constants/App"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { newYearTitleFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const NewYearScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(HOME_SCREEN_CLASSES, "flex flex-col bg-newyear-ink text-newyear-fizz")}
    >
      <div className="newyear-sky relative flex min-h-0 flex-1 flex-col gap-3 px-4 pt-2">
        <span
          aria-hidden
          className="newyear-confetti pointer-events-none absolute inset-x-0 -top-[120px] bottom-0 motion-safe:animate-fall"
        />
        <NewYearHeader snapshot={snapshot} gameweek={gameweek} />
        <NewYearTotals snapshot={snapshot} />
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 pt-5">
          <NewYearResolution league="premiership" snapshot={snapshot.premiership} side="left" />
          <NewYearResolution league="championship" snapshot={snapshot.championship} side="right" />
        </div>
      </div>

      <div className="relative z-20 flex shrink-0 flex-col gap-3 px-4 pb-4 pt-1">
        <NewYearSkyline className="absolute inset-x-0 bottom-full h-8 w-full" />
        <NewYearToasts snapshot={snapshot} />
        <HomeShareButton
          target={shareTarget}
          title={`${APP_NAME} New Year — Gameweek ${gameweek}`}
          label="Share the toast"
          className={cn(
            newYearTitleFont.className,
            "rounded-full bg-newyear-gold py-2.5 text-base font-normal tracking-widest text-newyear-ink shadow-[0_0_18px_var(--color-newyear-gold)]",
          )}
          iconClassName="h-4 w-4"
        />
      </div>
    </section>
  )
}
