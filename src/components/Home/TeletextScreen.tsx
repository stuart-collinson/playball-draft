import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { TeletextForfeitRow } from "@pbd/components/Home/TeletextForfeitRow"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { APP_NAME } from "@pbd/lib/constants/app"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import { buildHomeShareText, padGameweek } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const TELETEXT_PAGE = "PAGE 301"

const BAR_CLASSES = "flex shrink-0 justify-between px-3 py-1.5 text-xs font-black uppercase"

export const TeletextScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)

  return (
    <section
      className={cn(
        HOME_SCREEN_CLASSES,
        "flex flex-col gap-4 bg-teletext-black px-4 pb-4 pt-3 font-mono text-teletext-lime",
      )}
    >
      <header className="flex shrink-0 justify-between border-b border-teletext-olive pb-2 text-[11px] text-teletext-lime/80">
        <span>TELETEXT</span>
        <b className="text-white">{TELETEXT_PAGE}</b>
        <strong className="text-teletext-yellow">GW{gameweek}</strong>
      </header>

      <div className="shrink-0">
        <div className="bg-teletext-blue py-0.5 text-center font-sans text-4xl font-black uppercase tracking-wide text-teletext-lime">
          Football
        </div>
        <p className="mt-2 text-center text-[11px] uppercase text-teletext-lime/70">
          {APP_NAME} / Gameweek {gameweek}
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-dotted border-teletext-olive py-3 text-center">
        {LEAGUE_SLUGS.map((slug, index) => (
          <div key={slug} className={cn("flex flex-col", index === 1 && "col-start-3")}>
            <span className="text-[10px] uppercase text-teletext-lime/70">
              {LEAGUE_LABELS[slug]}
            </span>
            <strong className="text-3xl font-bold tabular-nums leading-tight text-teletext-yellow">
              {fmtPts(snapshot[slug].total)}
            </strong>
          </div>
        ))}
        <span className="col-start-2 row-start-1 text-[10px] uppercase text-white/60">v</span>
      </div>

      <div className="shrink-0">
        <div className={`${BAR_CLASSES} bg-teletext-red text-white`}>
          <span>Winners</span>
          <span>FT</span>
        </div>
        {LEAGUE_SLUGS.map((slug) => (
          <p
            key={slug}
            className="flex items-center justify-between gap-3 border-b border-dotted border-teletext-olive px-2 py-2.5"
          >
            <span className="w-24 shrink-0 text-[10px] uppercase text-teletext-lime/70">
              {LEAGUE_LABELS[slug]}
            </span>
            <span className="flex-1 text-base font-bold uppercase text-white">
              {snapshot[slug].winner?.name ?? "TBC"}
            </span>
            <strong className="text-base tabular-nums text-teletext-yellow">
              {fmtPts(snapshot[slug].winner?.points)} PTS
            </strong>
          </p>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`${BAR_CLASSES} bg-teletext-red text-white`}>
          <span>Forfeits</span>
          <span>Live</span>
        </div>
        <div className="flex flex-1 flex-col justify-evenly">
          {LEAGUE_SLUGS.map((slug) => (
            <TeletextForfeitRow key={slug} league={slug} snapshot={snapshot[slug]} />
          ))}
        </div>
      </div>

      <HomeShareButton
        title={`${APP_NAME} GW${gameweek} forfeits`}
        text={buildHomeShareText(snapshot)}
        label="Share the results"
        className="shrink-0 border border-teletext-lime bg-teletext-blue py-3 font-mono text-white"
        iconClassName="text-teletext-lime"
      />
    </section>
  )
}
