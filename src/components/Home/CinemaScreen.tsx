import { CinemaTicket } from "@pbd/components/Home/CinemaTicket"
import { HomeShareButton } from "@pbd/components/Home/HomeShareButton"
import { APP_NAME } from "@pbd/lib/constants/app"
import { buildHomeShareText, padGameweek, winnersLine } from "@pbd/lib/homeScreen"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import { Star } from "lucide-react"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const CinemaScreen = ({ snapshot }: Props): JSX.Element => {
  const gameweek = padGameweek(snapshot.gameweek)

  return (
    <section className="overflow-hidden bg-cinema-night sm:rounded-2xl px-5 pb-6 pt-5 text-cinema-ivory">
      <div className="neon-frame flex items-center justify-between border-2 border-cinema-purple px-4 py-2.5">
        <Star size={18} className="text-glow-cyan fill-current text-cinema-cyan" />
        <span className="text-glow-pink text-xl font-black uppercase tracking-[0.2em] text-cinema-pink">
          {APP_NAME}
        </span>
        <Star size={18} className="text-glow-cyan fill-current text-cinema-cyan" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
        <span>Winners: {winnersLine(snapshot.premiership, snapshot.championship)}</span>
        <span className="whitespace-nowrap text-cinema-cyan">Now playing / GW{gameweek}</span>
      </div>

      <div className="mt-9 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cinema-pink">
          A double feature
        </p>
        <h1 className="text-glow-purple mt-3 text-[52px] font-black uppercase leading-[0.86] tracking-[-0.06em] text-white">
          Forfeit
          <br />
          <span className="text-cinema-pink">After Dark</span>
        </h1>
        <p className="mt-3 text-sm text-cinema-lilac">Two tickets. Two terrible performances.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <CinemaTicket league="premiership" snapshot={snapshot.premiership} gameweek={gameweek} />
        <CinemaTicket league="championship" snapshot={snapshot.championship} gameweek={gameweek} />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-cinema-cyan py-3 text-center">
        <p className="col-span-3 text-[10px] uppercase tracking-[0.2em] text-cinema-cyan">
          League scoreboard
        </p>
        <strong className="text-2xl font-black tabular-nums text-white">
          {fmtPts(snapshot.premiership.total)}
        </strong>
        <span className="text-[10px] font-bold text-cinema-pink">VS</span>
        <strong className="text-2xl font-black tabular-nums text-white">
          {fmtPts(snapshot.championship.total)}
        </strong>
      </div>

      <HomeShareButton
        title={`Forfeit After Dark GW${gameweek}`}
        text={buildHomeShareText(snapshot)}
        label="Share your forfeit admission"
        className="neon-fill mt-5 bg-cinema-pink py-4 text-cinema-night"
      />
    </section>
  )
}
