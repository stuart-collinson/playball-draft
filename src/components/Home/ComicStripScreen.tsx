import { ComicPanel } from "@pbd/components/Home/ComicPanel"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { buildHomeShareText, padGameweek, winnersLine } from "@pbd/lib/homeScreen"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const ComicStripScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)

  return (
    <section className="overflow-hidden rounded-2xl bg-comic-ink px-5 pb-6 pt-5 text-comic-cream">
      <header className="flex items-start justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em]">
        <span className="whitespace-nowrap text-comic-red">The Weekly Issue</span>
        <span className="whitespace-nowrap">Issue {gameweek}</span>
        <span className="text-right">
          Winners: {winnersLine(snapshot.premiership, snapshot.championship)}
        </span>
      </header>

      <div className="comic-panel-shadow mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-[3px] border-comic-teal bg-comic-panel px-3 py-4 text-center">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-wide text-comic-yellow">
            {LEAGUE_LABELS.premiership}
          </span>
          <strong className="text-3xl font-black tabular-nums text-comic-teal">
            {fmtPts(snapshot.premiership.total)}
          </strong>
        </div>
        <span className="text-xs font-black text-comic-red">VS</span>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-wide text-comic-yellow">
            {LEAGUE_LABELS.championship}
          </span>
          <strong className="text-3xl font-black tabular-nums text-comic-teal">
            {fmtPts(snapshot.championship.total)}
          </strong>
        </div>
      </div>

      <h1 className="comic-title-shadow mt-8 text-[64px] font-black uppercase leading-[0.86] tracking-[-0.06em]">
        The
        <br />
        <span className="text-comic-teal">Forfeit</span>
        <br />
        Squad
      </h1>
      <p className="mt-4 text-sm text-comic-yellow">
        Gameweek {gameweek} has chosen its heroes... unfortunately.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <ComicPanel league="premiership" snapshot={snapshot.premiership} tone="red" burst="POW!" />
        <ComicPanel
          league="championship"
          snapshot={snapshot.championship}
          tone="sky"
          burst="OOF!"
        />
      </div>

      <HomeShareButton
        title={`The Weekly Issue ${gameweek}`}
        text={buildHomeShareText(snapshot)}
        label="Share this week's issue"
        className="mt-5 bg-comic-teal py-4 text-comic-navy"
      />
    </section>
  )
}
