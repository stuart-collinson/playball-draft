import { EasterBadEgg } from "@pbd/components/Home/Easter/EasterBadEgg"
import { EasterGoldenEggs } from "@pbd/components/Home/Easter/EasterGoldenEggs"
import { EasterHeader } from "@pbd/components/Home/Easter/EasterHeader"
import { EasterMeadow } from "@pbd/components/Home/Easter/EasterMeadow"
import { EasterTotals } from "@pbd/components/Home/Easter/EasterTotals"
import { EasterTulip } from "@pbd/components/Home/Easter/EasterTulip"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { cn } from "@pbd/lib/className"
import { APP_NAME } from "@pbd/lib/constants/App"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { easterTitleFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const TULIPS = [
  { position: "left-[7%]", tone: "lilac" },
  { position: "left-[11%]", tone: "butter" },
  { position: "left-[47%]", tone: "pink" },
  { position: "left-[51%]", tone: "butter" },
  { position: "right-[11%]", tone: "pink" },
  { position: "right-[7%]", tone: "lilac" },
] as const

export const EasterScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(HOME_SCREEN_CLASSES, "flex flex-col bg-easter-grass text-easter-ink")}
    >
      <div className="easter-sky relative flex min-h-0 flex-1 flex-col gap-3 px-4 pt-2">
        <EasterHeader snapshot={snapshot} gameweek={gameweek} />
        <EasterTotals snapshot={snapshot} />
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 pt-6">
          <EasterBadEgg league="premiership" snapshot={snapshot.premiership} side="left" />
          <EasterBadEgg league="championship" snapshot={snapshot.championship} side="right" />
        </div>
      </div>

      <div className="relative z-20 flex shrink-0 flex-col gap-3 px-4 pb-4 pt-1">
        <EasterMeadow className="absolute inset-x-0 bottom-full h-6 w-full" />
        {TULIPS.map(({ position, tone }) => (
          <EasterTulip
            key={position}
            tone={tone}
            className={cn("absolute bottom-[calc(100%-6px)] w-3", position)}
          />
        ))}
        <EasterGoldenEggs snapshot={snapshot} />
        <HomeShareButton
          target={shareTarget}
          title={`${APP_NAME} Bad Eggs — Gameweek ${gameweek}`}
          label="Share the hunt"
          className={cn(
            easterTitleFont.className,
            "rounded-full bg-easter-pink py-2.5 text-lg font-normal normal-case tracking-wide text-easter-ink shadow-[0_4px_0_var(--color-easter-lilac-deep)]",
          )}
          iconClassName="h-4 w-4"
        />
      </div>
    </section>
  )
}
