import { ComicPanel } from "@pbd/components/Home/ComicPanel"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { comicFont } from "@pbd/lib/fonts"
import { buildHomeShareText, padGameweek, winnersLine } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const SCORE_LABEL_CLASSES = "text-[9px] font-black uppercase tracking-[0.2em] text-black/70"

const SCORE_VALUE_CLASSES = `${comicFont.className} comic-outline text-4xl leading-none tracking-wide text-comic-yellow`

export const ComicStripScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(
        HOME_SCREEN_CLASSES,
        "halftone-paper flex flex-col border-4 border-black bg-comic-ink text-comic-cream",
      )}
    >
      <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b-4 border-black bg-comic-red px-4 py-2 text-comic-cream">
        <span
          className={`${comicFont.className} whitespace-nowrap text-lg uppercase tracking-wider`}
        >
          The Weekly Issue
        </span>
        <span
          className={`${comicFont.className} -rotate-3 border-[3px] border-black bg-comic-yellow px-2.5 py-0.5 text-sm uppercase tracking-wider text-black`}
        >
          Issue #{gameweek}
        </span>
        <span className="text-right text-[9px] font-black uppercase leading-tight tracking-wider">
          Winners
          <br />
          {winnersLine(snapshot.premiership, snapshot.championship)}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-5 pt-4">
        <div className="comic-shadow grid shrink-0 -rotate-1 grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border-4 border-black bg-comic-cream px-3 py-3 text-center">
          <div className="flex flex-col gap-1">
            <span className={SCORE_LABEL_CLASSES}>{LEAGUE_LABELS.premiership}</span>
            <strong className={SCORE_VALUE_CLASSES}>{fmtPts(snapshot.premiership.total)}</strong>
          </div>
          <span className="comic-burst flex h-14 w-14 rotate-6 items-center justify-center bg-black">
            <span
              className={`${comicFont.className} comic-burst flex h-[calc(100%-6px)] w-[calc(100%-6px)] items-center justify-center bg-comic-red text-base text-comic-cream`}
            >
              VS
            </span>
          </span>
          <div className="flex flex-col gap-1">
            <span className={SCORE_LABEL_CLASSES}>{LEAGUE_LABELS.championship}</span>
            <strong className={SCORE_VALUE_CLASSES}>{fmtPts(snapshot.championship.total)}</strong>
          </div>
        </div>

        <div className="relative grid shrink-0 grid-cols-[1fr_auto] items-center gap-3">
          <span
            aria-hidden
            className="comic-rays pointer-events-none absolute -inset-y-6 -inset-x-4"
          />
          <h1
            className={`${comicFont.className} comic-outline comic-title-shadow relative -skew-x-6 text-[52px] uppercase leading-[0.85] tracking-wide text-comic-cream`}
          >
            The
            <br />
            <span className="text-comic-yellow">Forfeit</span>
            <br />
            Squad
          </h1>
          <div className="relative rotate-3">
            <HomeShareButton
              target={shareTarget}
              title={`The Weekly Issue #${gameweek}`}
              text={buildHomeShareText(snapshot)}
              label="Share this!"
              className={`${comicFont.className} comic-shadow-sm w-auto flex-col gap-0 rounded-[2.5rem] border-4 border-black bg-comic-red px-5 py-4 text-2xl leading-none tracking-wider text-comic-cream`}
              iconClassName="mb-1.5 h-8 w-8"
            />
            <span
              aria-hidden
              className="absolute -bottom-[18px] left-5 h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-black"
            />
            <span
              aria-hidden
              className="absolute -bottom-[10px] left-[26px] h-0 w-0 border-x-[7px] border-t-[13px] border-x-transparent border-t-comic-red"
            />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 px-1 pb-2">
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
      </div>
    </section>
  )
}
