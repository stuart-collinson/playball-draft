import { CupFinalFeature } from "@pbd/components/Home/CupFinal/CupFinalFeature"
import { CupFinalFloodlights } from "@pbd/components/Home/CupFinal/CupFinalFloodlights"
import { CupFinalRoundup } from "@pbd/components/Home/CupFinal/CupFinalRoundup"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { cn } from "@pbd/lib/className"
import { APP_NAME } from "@pbd/lib/constants/App"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { cupFinalTitleFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const CupFinalScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(
        HOME_SCREEN_CLASSES,
        "cupfinal-night relative flex flex-col text-cupfinal-silver",
      )}
    >
      <CupFinalFloodlights />
      <div className="relative flex min-h-0 flex-1 flex-col px-4 pt-2">
        <CupFinalFeature gameweek={snapshot.gameweek} />
      </div>
      <div className="relative z-10 flex shrink-0 flex-col gap-3 px-4 pb-4 pt-4">
        <CupFinalRoundup snapshot={snapshot} />
        <HomeShareButton
          target={shareTarget}
          title={`${APP_NAME} Cup Final — Gameweek ${gameweek}`}
          label="Share the final"
          className={cn(
            cupFinalTitleFont.className,
            "cupfinal-plate rounded-full py-2.5 text-[11px] tracking-[0.25em] text-cupfinal-midnight",
          )}
          iconClassName="h-4 w-4"
        />
      </div>
    </section>
  )
}
