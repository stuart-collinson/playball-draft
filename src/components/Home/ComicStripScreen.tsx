import { ComicPanel } from "@pbd/components/Home/ComicPanel"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { comicFont } from "@pbd/lib/fonts"
import { buildHomeShareText, padGameweek, winnersLine } from "@pbd/lib/homeScreen"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const SCORE_LABEL_CLASSES = "text-[10px] font-black uppercase tracking-[0.2em] text-black/70"

const SCORE_VALUE_CLASSES = `${comicFont.className} text-5xl leading-none tracking-wide text-comic-red comic-outline`

export const ComicStripScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)

  return (
    <section className="halftone-paper overflow-hidden border-4 border-black bg-comic-cream text-black sm:rounded-2xl">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b-4 border-black bg-comic-red px-4 py-2.5 text-comic-cream">
        <span
          className={`${comicFont.className} whitespace-nowrap text-lg uppercase tracking-wider`}
        >
          The Weekly Issue
        </span>
        <span className="border-2 border-black bg-comic-yellow px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-black">
          Issue #{gameweek}
        </span>
        <span className="text-right text-[9px] font-black uppercase leading-tight tracking-wider">
          Winners
          <br />
          {winnersLine(snapshot.premiership, snapshot.championship)}
        </span>
      </header>

      <div className="px-4 pb-6 pt-5">
        <div className="comic-shadow grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-4 border-black bg-white px-3 py-4 text-center">
          <div className="flex flex-col gap-1">
            <span className={SCORE_LABEL_CLASSES}>{LEAGUE_LABELS.premiership}</span>
            <strong className={SCORE_VALUE_CLASSES}>{fmtPts(snapshot.premiership.total)}</strong>
          </div>
          <span
            className={`${comicFont.className} comic-burst flex h-14 w-14 rotate-6 items-center justify-center bg-comic-yellow text-lg text-black`}
          >
            VS
          </span>
          <div className="flex flex-col gap-1">
            <span className={SCORE_LABEL_CLASSES}>{LEAGUE_LABELS.championship}</span>
            <strong className={SCORE_VALUE_CLASSES}>{fmtPts(snapshot.championship.total)}</strong>
          </div>
        </div>

        <h1
          className={`${comicFont.className} comic-outline comic-title-shadow mt-8 -skew-x-6 text-[76px] uppercase leading-[0.85] tracking-wide text-comic-cream`}
        >
          The
          <br />
          <span className="text-comic-yellow">Forfeit</span>
          <br />
          Squad
        </h1>

        <p className="comic-shadow-sm relative mt-6 inline-block border-[3px] border-black bg-white px-4 py-2.5 text-sm font-bold italic">
          Gameweek {gameweek} has chosen its heroes... unfortunately.
          <span
            aria-hidden
            className="absolute -bottom-3 left-8 h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-black"
          />
        </p>

        <div className="mt-7 grid grid-cols-2 gap-4 pb-3">
          <ComicPanel
            league="premiership"
            snapshot={snapshot.premiership}
            tone="red"
            burst="POW!"
          />
          <ComicPanel
            league="championship"
            snapshot={snapshot.championship}
            tone="sky"
            burst="OOF!"
          />
        </div>

        <HomeShareButton
          title={`The Weekly Issue #${gameweek}`}
          text={buildHomeShareText(snapshot)}
          label="Share this week's issue"
          className={`${comicFont.className} comic-shadow mt-7 border-4 border-black bg-comic-yellow py-3.5 text-lg tracking-wider text-black`}
        />
      </div>
    </section>
  )
}
