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
        "flex flex-col gap-3 bg-teletext-black px-4 pb-4 pt-3 font-mono text-teletext-lime",
      )}
    >
      <header className="flex shrink-0 justify-between border-b border-teletext-lime pb-2 text-[11px]">
        <span>TELETEXT</span>
        <b className="text-white">{TELETEXT_PAGE}</b>
        <strong className="text-teletext-yellow">GW{gameweek}</strong>
      </header>

      <div className="shrink-0 bg-teletext-blue py-0.5 text-center font-sans text-4xl font-black uppercase tracking-wide">
        Football
      </div>
      <p className="shrink-0 text-center font-sans text-sm font-black uppercase leading-tight text-white">
        Teletext football results
        <span className="block text-teletext-lime">on your phone</span>
      </p>

      <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-0.5 bg-teletext-blue px-3 py-2 text-[11px] uppercase text-white">
        <p className="col-span-2 font-bold text-teletext-lime">League scores / GW{gameweek}</p>
        {LEAGUE_SLUGS.map((slug) => (
          <p key={slug} className="flex items-end justify-between gap-2">
            <span>{LEAGUE_LABELS[slug]}</span>
            <strong className="text-lg tabular-nums text-teletext-yellow">
              {fmtPts(snapshot[slug].total)}
            </strong>
          </p>
        ))}
      </div>

      <div className="shrink-0 bg-teletext-blue px-3 py-1 text-[11px] uppercase text-white">
        {APP_NAME} / Gameweek {gameweek} / Scores
      </div>

      <div className="shrink-0">
        <div className={`${BAR_CLASSES} bg-teletext-blue text-white`}>
          <span>Gameweek winners</span>
          <span className="text-teletext-lime">FT</span>
        </div>
        {LEAGUE_SLUGS.map((slug) => (
          <p
            key={slug}
            className="flex items-center justify-between border-b border-dotted border-teletext-olive px-2 py-2 text-xs text-white"
          >
            <b className="uppercase text-teletext-lime">{LEAGUE_LABELS[slug]}</b>
            <span>{snapshot[slug].winner?.name ?? "TBC"}</span>
            <strong className="tabular-nums text-teletext-yellow">
              {fmtPts(snapshot[slug].winner?.points)} PTS
            </strong>
          </p>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`${BAR_CLASSES} bg-teletext-lime text-teletext-black`}>
          <span>Forfeit results</span>
          <span className="text-teletext-blue">Live</span>
        </div>
        <div className="flex flex-1 flex-col justify-evenly">
          {LEAGUE_SLUGS.map((slug, index) => (
            <TeletextForfeitRow
              key={slug}
              index={padGameweek(index + 1)}
              snapshot={snapshot[slug]}
            />
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
