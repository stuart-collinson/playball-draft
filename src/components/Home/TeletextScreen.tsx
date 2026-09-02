import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { TeletextForfeitRow } from "@pbd/components/Home/TeletextForfeitRow"
import { APP_NAME } from "@pbd/lib/constants/app"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import { buildHomeShareText, padGameweek } from "@pbd/lib/homeScreen"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const TELETEXT_PAGE = "PAGE 301"

const BAR_CLASSES = "mt-4 flex justify-between px-3 py-1.5 text-xs font-black uppercase"

export const TeletextScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const issued = LEAGUE_SLUGS.filter((slug) => snapshot[slug].loser !== null).length

  return (
    <section className="overflow-hidden rounded-2xl bg-teletext-black px-4 pb-6 pt-4 font-mono text-teletext-lime">
      <header className="flex justify-between border-b border-teletext-lime pb-2 text-[11px]">
        <span>TELETEXT</span>
        <b className="text-white">{TELETEXT_PAGE}</b>
        <strong className="text-teletext-yellow">GW{gameweek}</strong>
      </header>

      <div className="mt-6 bg-teletext-blue py-1 text-center font-sans text-5xl font-black uppercase tracking-wide">
        Football
      </div>
      <p className="mt-3 text-center font-sans text-base font-black uppercase leading-tight text-white">
        Teletext football results
        <span className="block text-teletext-lime">on your phone</span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1 bg-teletext-blue px-3 py-2 text-[11px] uppercase text-white">
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

      <div className="mt-4 bg-teletext-blue px-3 py-1.5 text-[11px] uppercase text-white">
        {APP_NAME} / Gameweek {gameweek} / Scores
      </div>

      <div className={`${BAR_CLASSES} bg-teletext-blue text-white`}>
        <span>Gameweek winners</span>
        <span className="text-teletext-lime">FT</span>
      </div>
      {LEAGUE_SLUGS.map((slug) => (
        <p
          key={slug}
          className="flex items-center justify-between border-b border-dotted border-teletext-olive px-2 py-2.5 text-xs text-white"
        >
          <b className="uppercase text-teletext-lime">{LEAGUE_LABELS[slug]}</b>
          <span>{snapshot[slug].winner?.name ?? "TBC"}</span>
          <strong className="tabular-nums text-teletext-yellow">
            {fmtPts(snapshot[slug].winner?.points)} PTS
          </strong>
        </p>
      ))}

      <div className={`${BAR_CLASSES} bg-teletext-lime text-teletext-black`}>
        <span>Forfeit results</span>
        <span className="text-teletext-blue">Live</span>
      </div>
      {LEAGUE_SLUGS.map((slug, index) => (
        <TeletextForfeitRow key={slug} index={padGameweek(index + 1)} snapshot={snapshot[slug]} />
      ))}

      <div className={`${BAR_CLASSES} bg-teletext-blue text-white`}>
        <span>Gameweek {gameweek}</span>
        <span className="text-teletext-lime">Playball league</span>
      </div>
      <p className="px-2 py-2 text-[10px] uppercase text-teletext-yellow">
        {issued} forfeits issued · Page 1/1
      </p>

      <HomeShareButton
        title={`${APP_NAME} GW${gameweek} forfeits`}
        text={buildHomeShareText(snapshot)}
        label="Press red to share forfeits"
        className="mt-4 border border-teletext-lime bg-teletext-blue py-3.5 font-mono text-white"
        iconClassName="text-teletext-lime"
      />
      <p className="mt-6 border-t border-teletext-lime pt-3 text-[10px] uppercase text-white">
        Press 9 for group chat reaction
      </p>
    </section>
  )
}
