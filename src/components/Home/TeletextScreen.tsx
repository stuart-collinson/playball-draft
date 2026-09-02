import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { TeletextForfeitRow } from "@pbd/components/Home/TeletextForfeitRow"
import { HOME_SCREEN_CLASSES, TELETEXT_LEAGUE_LABELS } from "@pbd/lib/constants/Home"
import { APP_NAME } from "@pbd/lib/constants/app"
import { LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import { teletextFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const TELETEXT_PAGE = "P301"

const BAR_CLASSES =
  "flex shrink-0 items-center justify-between bg-teletext-red px-2 py-2 text-[9px] text-white"

const RULE_CLASSES = "h-0.5 shrink-0 bg-teletext-dim"

export const TeletextScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(
        HOME_SCREEN_CLASSES,
        teletextFont.className,
        "relative flex flex-col justify-between gap-3 bg-teletext-black px-3 pb-3 pt-3 text-teletext-lime",
      )}
    >
      <header className="flex shrink-0 items-center justify-between text-[9px]">
        <span className="text-teletext-cyan">TELETEXT</span>
        <b className="text-white">{TELETEXT_PAGE}</b>
        <strong className="text-teletext-yellow">GW{gameweek}</strong>
      </header>

      <div className="shrink-0">
        <div className="teletext-glow bg-teletext-blue py-2.5 text-center text-[30px] leading-none text-teletext-yellow">
          FOOTBALL
        </div>
        <p className="mt-2.5 text-center text-[8px] leading-relaxed text-teletext-cyan">
          {APP_NAME.toUpperCase()} / GAMEWEEK {gameweek}
        </p>
      </div>

      <div className={RULE_CLASSES} />

      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-end gap-2 text-center">
        {LEAGUE_SLUGS.map((slug, index) => (
          <div key={slug} className={cn("flex flex-col gap-2.5", index === 1 && "col-start-3")}>
            <span className="text-[8px] text-teletext-cyan">{TELETEXT_LEAGUE_LABELS[slug]}</span>
            <strong className="teletext-glow text-[26px] leading-none text-teletext-yellow">
              {fmtPts(snapshot[slug].total)}
            </strong>
          </div>
        ))}
        <span className="col-start-2 row-start-1 pb-1.5 text-[11px] text-white">V</span>
      </div>

      <div className={RULE_CLASSES} />

      <div className="shrink-0">
        <div className={BAR_CLASSES}>
          <span>WINNERS</span>
          <span>FT</span>
        </div>
        {LEAGUE_SLUGS.map((slug) => (
          <p
            key={slug}
            className="flex items-center gap-2 border-b-2 border-teletext-dim px-2 py-3 text-[10px]"
          >
            <span className="w-14 shrink-0 text-[8px] text-teletext-cyan">
              {TELETEXT_LEAGUE_LABELS[slug]}
            </span>
            <span className="flex-1 truncate text-white">
              {(snapshot[slug].winner?.name ?? "TBC").toUpperCase()}
            </span>
            <strong className="shrink-0 text-teletext-yellow">
              {fmtPts(snapshot[slug].winner?.points)}
            </strong>
          </p>
        ))}
      </div>

      <div className="shrink-0">
        <div className={BAR_CLASSES}>
          <span>FORFEITS</span>
          <span>LIVE</span>
        </div>
        {LEAGUE_SLUGS.map((slug) => (
          <TeletextForfeitRow key={slug} league={slug} snapshot={snapshot[slug]} />
        ))}
      </div>

      <HomeShareButton
        target={shareTarget}
        title={`${APP_NAME} GW${gameweek} forfeits`}
        label="Share the results"
        className={cn(
          teletextFont.className,
          "shrink-0 bg-teletext-lime py-3.5 text-[10px] tracking-normal text-black",
        )}
        iconClassName="text-black"
      />

      <span
        aria-hidden
        className="teletext-scanlines pointer-events-none absolute inset-0 z-10 sm:rounded-2xl"
      />
    </section>
  )
}
