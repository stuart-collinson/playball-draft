import { CinemaTicket } from "@pbd/components/Home/CinemaTicket"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { APP_NAME } from "@pbd/lib/constants/app"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { buildHomeShareText, padGameweek, winnersLine } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import { Star } from "lucide-react"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const SCORE_LABEL_CLASSES = "text-[9px] uppercase tracking-[0.2em] text-cinema-cyan"

export const CinemaScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)
  const shareTarget = useRef<HTMLElement>(null)

  return (
    <section
      ref={shareTarget}
      className={cn(
        HOME_SCREEN_CLASSES,
        "flex flex-col gap-3 bg-cinema-night px-4 pb-4 pt-4 text-cinema-ivory",
      )}
    >
      <div className="neon-frame flex shrink-0 items-center justify-between border-2 border-cinema-purple px-4 py-2">
        <Star size={16} className="text-glow-cyan fill-current text-cinema-cyan" />
        <span className="text-glow-pink text-lg font-black uppercase tracking-[0.2em] text-cinema-pink">
          {APP_NAME}
        </span>
        <Star size={16} className="text-glow-cyan fill-current text-cinema-cyan" />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
        <span>Winners: {winnersLine(snapshot.premiership, snapshot.championship)}</span>
        <span className="whitespace-nowrap text-cinema-cyan">Now playing / GW{gameweek}</span>
      </div>

      <div className="shrink-0 pt-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cinema-pink">
          A double feature
        </p>
        <h1 className="text-glow-purple mt-2 text-[44px] font-black uppercase leading-[0.86] tracking-[-0.06em] text-white">
          Forfeit
          <br />
          <span className="text-cinema-pink">After Dark</span>
        </h1>
        <p className="mt-2 text-xs text-cinema-lilac">Two tickets. Two terrible performances.</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 pt-1">
        <CinemaTicket league="premiership" snapshot={snapshot.premiership} gameweek={gameweek} />
        <CinemaTicket league="championship" snapshot={snapshot.championship} gameweek={gameweek} />
      </div>

      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-cinema-cyan py-2 text-center">
        <div className="flex flex-col">
          <span className={SCORE_LABEL_CLASSES}>{LEAGUE_LABELS.premiership}</span>
          <strong className="text-2xl font-black tabular-nums leading-tight text-white">
            {fmtPts(snapshot.premiership.total)}
          </strong>
        </div>
        <span className="text-[10px] font-bold text-cinema-pink">VS</span>
        <div className="flex flex-col">
          <span className={SCORE_LABEL_CLASSES}>{LEAGUE_LABELS.championship}</span>
          <strong className="text-2xl font-black tabular-nums leading-tight text-white">
            {fmtPts(snapshot.championship.total)}
          </strong>
        </div>
      </div>

      <HomeShareButton
        target={shareTarget}
        title={`Forfeit After Dark GW${gameweek}`}
        text={buildHomeShareText(snapshot)}
        label="Share your admission"
        className="neon-fill shrink-0 bg-cinema-pink py-3 text-cinema-night"
      />
    </section>
  )
}
